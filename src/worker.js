// Cloudflare Worker: serves the static Astro site + the studio's small backend.
//
// Storage = Workers KV (binding DB). Keys:
//   auth                     {salt, hash, iter}            admin password (PBKDF2-SHA256)
//   session:<token>          {at}                          admin session, 30-day TTL
//   rl:<ip>                  n                             failed-login counter, 15-min TTL
//   settings                 {...}                         prices, templates, studio WhatsApp, flags
//   lead:<id>                enquiry (metadata = summary for fast listing)
//   quote:<id>               quote   (metadata = summary)
//   qpub:<token>             quote id                      public quote link → quote
//   review:<id>              review  (metadata = summary)
//   rphoto:<id>              review photo (data URL)
//   counter:quote            last quote number
//
// Public:  POST /api/lead · GET /api/public/settings · GET /api/public/reviews
//          GET /api/public/review-photo/:id · GET /q/:token (client quote page)
// Admin:   /api/admin/*  (cookie session; mutating calls must be same-origin JSON)
import { AwsClient } from "aws4fetch";

const FROM_ADDRESS = "noreply@zeabyte.co.nz";
const DEFAULT_TO = "parminder@zeabyte.co.nz";
const STUDIO = "RK Bridal Studio";
const DEFAULT_WA = "919800000000";

// ---------------------------------------------------------------- helpers
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);
const clip = (s, n = 1500) => String(s ?? "").slice(0, n);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0; };
const rid = (n = 16) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join(""); };
const now = () => new Date().toISOString();
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inr = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

async function pbkdf2(password, saltB64, iter = 100000) {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const cookie = (req, name) => (req.headers.get("cookie") || "").split(/;\s*/).map((c) => c.split("=")).find(([k]) => k === name)?.[1];

// ---------------------------------------------------------------- settings
const DEFAULT_SETTINGS = {
  studioWhatsapp: DEFAULT_WA,
  showPricesOnSite: false,
  advancePercent: 30,
  quoteTerms: "This quote is valid for 14 days. Your date is confirmed once the advance is received. The balance is due before the wedding day. Travel outside Jalandhar is shown as a separate line.",
  prices: [
    { key: "bridal-hd", label: "Bridal makeup — HD (with hair + draping)", price: 0, unit: "per bride" },
    { key: "bridal-airbrush", label: "Bridal makeup — Airbrush (with hair + draping)", price: 0, unit: "per bride" },
    { key: "groom", label: "Groom makeup & grooming", price: 0, unit: "per event" },
    { key: "engagement", label: "Engagement / Roka / Sagan look", price: 0, unit: "per event" },
    { key: "reception", label: "Reception look", price: 0, unit: "per event" },
    { key: "mehndi-jaggo", label: "Mehndi / Jaggo / Maiyan look", price: 0, unit: "per event" },
    { key: "family", label: "Family / party makeup + hair", price: 0, unit: "per person" },
    { key: "hair", label: "Hairstyling only", price: 0, unit: "per person" },
    { key: "draping", label: "Saree / dupatta draping only", price: 0, unit: "per person" },
    { key: "trial", label: "Bridal trial", price: 0, unit: "per trial" },
    { key: "standby", label: "Artist on standby (full day)", price: 0, unit: "per day" },
    { key: "travel", label: "Travel", price: 0, unit: "per trip" },
  ],
  templates: [
    { id: "thanks", title: "Thank you for enquiring", text: "Sat Sri Akal {name} ji! 🙏 Thank you for contacting {studio}. Congratulations on your wedding! Could you share your wedding date, city and which events you need makeup for? We'll send you a full quote." },
    { id: "quote", title: "Send the quote", text: "Hi {name} ji, here is your quote from {studio} 💐\n{link}\nTotal: {total}\nTo confirm your date, the advance is {advance}. Any questions, just reply here." },
    { id: "trial", title: "Trial reminder", text: "Hi {name} ji, a reminder of your bridal trial with {studio}. Please bring your outfit (or photos), jewellery and come with a clean, moisturised face. See you soon! 💄" },
    { id: "advance", title: "Advance received", text: "Hi {name} ji, we've received your advance — your date {date} is confirmed with {studio}! 🎉 We'll be in touch before the wedding with timings." },
    { id: "dayBefore", title: "Day before the wedding", text: "Hi {name} ji, all set for tomorrow! Our team will arrive on time. Please sleep well, drink water and keep your outfit and jewellery ready. Can't wait! ✨" },
    { id: "review", title: "Ask for a review", text: "Hi {name} ji, it was an honour to be part of your wedding! 💖 Would you send us two lines about your experience and one favourite photo? With your permission we'd love to share it on our website." },
  ],
};
async function getSettings(env) {
  const s = (await env.DB.get("settings", "json")) || {};
  return { ...DEFAULT_SETTINGS, ...s, prices: s.prices || DEFAULT_SETTINGS.prices, templates: s.templates || DEFAULT_SETTINGS.templates };
}

// ---------------------------------------------------------------- auth
async function isAuthed(req, env) {
  const t = cookie(req, "rk_s");
  if (!t || !/^[a-z0-9]{32}$/.test(t)) return false;
  return !!(await env.DB.get("session:" + t));
}
async function login(req, env) {
  const ip = req.headers.get("cf-connecting-ip") || "x";
  const tries = Number(await env.DB.get("rl:" + ip)) || 0;
  if (tries >= 10) return bad("Too many attempts. Please wait 15 minutes.", 429);
  const { password } = await req.json().catch(() => ({}));
  const auth = await env.DB.get("auth", "json");
  if (!auth) return bad("Password not set up yet.", 503);
  const ok = password && safeEqual(await pbkdf2(String(password), auth.salt, auth.iter), auth.hash);
  if (!ok) {
    await env.DB.put("rl:" + ip, String(tries + 1), { expirationTtl: 900 });
    return bad("Wrong password", 401);
  }
  const token = rid(32);
  await env.DB.put("session:" + token, now(), { expirationTtl: 60 * 60 * 24 * 30 });
  return json({ ok: true }, 200, { "set-cookie": `rk_s=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}` });
}
async function logout(req, env) {
  const t = cookie(req, "rk_s");
  if (t) await env.DB.delete("session:" + t);
  return json({ ok: true }, 200, { "set-cookie": "rk_s=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
}
async function changePassword(req, env) {
  const { current, next } = await req.json().catch(() => ({}));
  if (!next || String(next).length < 8) return bad("New password must be at least 8 characters.");
  const auth = await env.DB.get("auth", "json");
  if (!auth || !safeEqual(await pbkdf2(String(current || ""), auth.salt, auth.iter), auth.hash)) return bad("Current password is wrong.", 401);
  const salt = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  await env.DB.put("auth", JSON.stringify({ salt, iter: 100000, hash: await pbkdf2(String(next), salt, 100000) }));
  return json({ ok: true });
}

// ---------------------------------------------------------------- generic list
// Each collection keeps a single index key (idx:<kind> = {id: summary}) so a save shows up instantly
// (KV list() can lag ~60 s). Falls back to rebuilding from list() if the index is missing.
async function readIdx(env, kind) {
  const m = await env.DB.get("idx:" + kind, "json");
  if (m) return m;
  const rebuilt = {};
  for (const r of await listByPrefix(env, kind + ":")) { const { id, ...meta } = r; rebuilt[id] = meta; }
  await env.DB.put("idx:" + kind, JSON.stringify(rebuilt));
  return rebuilt;
}
async function idxSet(env, kind, id, meta) {
  const m = await readIdx(env, kind);
  if (meta) m[id] = meta; else delete m[id];
  await env.DB.put("idx:" + kind, JSON.stringify(m));
}
async function listIdx(env, kind) {
  return Object.entries(await readIdx(env, kind)).map(([id, meta]) => ({ id, ...meta }));
}
async function listByPrefix(env, prefix) {
  const out = []; let cursor;
  do {
    const r = await env.DB.list({ prefix, cursor, limit: 1000 });
    for (const k of r.keys) out.push({ id: k.name.slice(prefix.length), ...(k.metadata || {}) });
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  return out;
}

// ---------------------------------------------------------------- leads
const leadMeta = (l) => ({ name: clip(l.name, 60), phone: clip(l.phone, 20), date: l.date || "", city: clip(l.city, 40), status: l.status, createdAt: l.createdAt, events: clip(l.events, 80) });
async function handleLead(request, env) {
  let data;
  try { data = await request.json(); } catch { return bad("bad json"); }
  if (data.botcheck) return json({ ok: true });
  const lead = {
    name: clip(data.name, 80), phone: clip(data.phone, 30), date: clip(data.date, 12), city: clip(data.city, 80),
    who: clip(data.who, 30), events: clip(data.events, 300), message: clip(data.message, 1500),
    status: "new", notes: "", createdAt: now(), source: "website",
  };
  if (!lead.name || !lead.phone) return bad("missing fields");
  const id = Date.now().toString(36) + "-" + rid(6);
  if (env.DB) { await env.DB.put("lead:" + id, JSON.stringify(lead), { metadata: leadMeta(lead) }); await idxSet(env, "lead", id, leadMeta(lead)); }

  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    const region = env.SES_REGION || "ap-southeast-2";
    const aws = new AwsClient({ accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY, service: "ses", region });
    const body = [`New booking enquiry from the website`, ``, `Name: ${lead.name}`, `Phone: ${lead.phone}`, `Wedding date: ${lead.date || "-"}`, `City/venue: ${lead.city || "-"}`, `For: ${lead.who || "-"}`, `Events: ${lead.events || "-"}`, ``, lead.message || ""].join("\n");
    await aws.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ FromEmailAddress: `${STUDIO} website <${FROM_ADDRESS}>`, Destination: { ToAddresses: [env.LEAD_TO || DEFAULT_TO] }, Content: { Simple: { Subject: { Data: `💍 Booking enquiry — ${lead.name}` }, Body: { Text: { Data: body } } } } }),
    }).catch(() => {});
  }
  return json({ ok: true });
}

// ---------------------------------------------------------------- quotes
function quoteTotals(q) {
  const sub = (q.items || []).reduce((a, i) => a + num(i.qty) * num(i.price), 0);
  const total = Math.max(0, sub - num(q.discount));
  return { subtotal: sub, total, balance: Math.max(0, total - num(q.advance)) };
}
const quoteMeta = (q) => ({ number: q.number, name: clip(q.client?.name, 60), phone: clip(q.client?.phone, 20), weddingDate: q.weddingDate || "", total: quoteTotals(q).total, status: q.status, version: q.version, updatedAt: q.updatedAt, pub: q.publicToken });
function cleanQuote(b, prev) {
  return {
    client: { name: clip(b.client?.name, 80), phone: clip(b.client?.phone, 30), email: clip(b.client?.email, 120) },
    weddingDate: clip(b.weddingDate, 12), city: clip(b.city, 80), venue: clip(b.venue, 120),
    events: clip(b.events, 300),
    items: (Array.isArray(b.items) ? b.items : []).slice(0, 40).map((i) => ({ label: clip(i.label, 120), qty: num(i.qty) || 1, price: num(i.price), note: clip(i.note, 120) })).filter((i) => i.label),
    discount: num(b.discount), advance: num(b.advance), notes: clip(b.notes, 2000),
    status: ["draft", "sent", "accepted", "booked", "cancelled"].includes(b.status) ? b.status : prev?.status || "draft",
    leadId: clip(b.leadId, 40) || prev?.leadId || "",
  };
}
async function saveQuote(env, id, q) {
  await env.DB.put("quote:" + id, JSON.stringify(q), { metadata: quoteMeta(q) });
  await idxSet(env, "quote", id, quoteMeta(q));
}

// ---------------------------------------------------------------- reviews
const reviewMeta = (r) => ({ name: clip(r.name, 60), city: clip(r.city, 40), event: r.event, published: r.published, hasPhoto: !!r.hasPhoto, createdAt: r.createdAt });

// ---------------------------------------------------------------- admin router
async function admin(req, env, path) {
  if (path === "/api/admin/login" && req.method === "POST") return login(req, env);
  if (path === "/api/admin/logout" && req.method === "POST") return logout(req, env);
  if (!(await isAuthed(req, env))) return bad("Please log in", 401);
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(req.url).host) return bad("Bad origin", 403);
    if (req.method !== "DELETE" && !(req.headers.get("content-type") || "").includes("application/json")) return bad("JSON only", 415);
  }
  const body = req.method === "GET" || req.method === "DELETE" ? {} : await req.json().catch(() => ({}));
  const seg = path.split("/").filter(Boolean); // api, admin, thing, id?
  const [, , thing, id] = seg;

  if (thing === "me") return json({ ok: true });
  if (thing === "password" && req.method === "POST") return changePassword(new Request(req.url, { method: "POST", body: JSON.stringify(body) }), env);

  if (thing === "settings") {
    if (req.method === "GET") return json({ ok: true, settings: await getSettings(env) });
    if (req.method === "PUT") {
      const cur = await getSettings(env);
      const s = {
        ...cur,
        studioWhatsapp: String(body.studioWhatsapp ?? cur.studioWhatsapp).replace(/\D/g, "").slice(0, 15) || DEFAULT_WA,
        showPricesOnSite: !!body.showPricesOnSite,
        advancePercent: Math.min(100, Math.max(0, num(body.advancePercent ?? cur.advancePercent))),
        quoteTerms: clip(body.quoteTerms ?? cur.quoteTerms, 2000),
        prices: Array.isArray(body.prices) ? body.prices.slice(0, 40).map((p, i) => ({ key: clip(p.key, 40) || "item" + i, label: clip(p.label, 120), price: num(p.price), unit: clip(p.unit, 30) })).filter((p) => p.label) : cur.prices,
        templates: Array.isArray(body.templates) ? body.templates.slice(0, 30).map((t, i) => ({ id: clip(t.id, 40) || "t" + i, title: clip(t.title, 80), text: clip(t.text, 1500) })).filter((t) => t.title && t.text) : cur.templates,
      };
      await env.DB.put("settings", JSON.stringify(s));
      return json({ ok: true, settings: s });
    }
  }

  if (thing === "dashboard") {
    const [leads, quotes] = await Promise.all([listIdx(env, "lead"), listIdx(env, "quote")]);
    const today = new Date().toISOString().slice(0, 10);
    return json({
      ok: true,
      newLeads: leads.filter((l) => l.status === "new").length,
      openQuotes: quotes.filter((q) => ["draft", "sent", "accepted"].includes(q.status)).length,
      bookings: quotes.filter((q) => q.status === "booked" && (q.weddingDate || "") >= today).sort((a, b) => (a.weddingDate || "").localeCompare(b.weddingDate || "")).slice(0, 20),
    });
  }

  if (thing === "leads") {
    if (req.method === "GET" && !id) return json({ ok: true, leads: (await listIdx(env, "lead")).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")) });
    if (req.method === "POST" && !id) {
      const lead = { name: clip(body.name, 80), phone: clip(body.phone, 30), date: clip(body.date, 12), city: clip(body.city, 80), who: clip(body.who, 30), events: clip(body.events, 300), message: clip(body.message, 1500), status: "new", notes: clip(body.notes, 2000), createdAt: now(), source: clip(body.source, 30) || "manual" };
      if (!lead.name) return bad("Name is needed");
      const nid = Date.now().toString(36) + "-" + rid(6);
      await env.DB.put("lead:" + nid, JSON.stringify(lead), { metadata: leadMeta(lead) }); await idxSet(env, "lead", nid, leadMeta(lead));
      return json({ ok: true, id: nid });
    }
    const key = "lead:" + id;
    const lead = await env.DB.get(key, "json");
    if (!lead) return bad("Not found", 404);
    if (req.method === "GET") return json({ ok: true, lead: { id, ...lead } });
    if (req.method === "PATCH") {
      for (const f of ["name", "phone", "date", "city", "who", "events", "message", "notes"]) if (f in body) lead[f] = clip(body[f], f === "notes" || f === "message" ? 2000 : 120);
      if (["new", "contacted", "quoted", "booked", "lost"].includes(body.status)) lead.status = body.status;
      await env.DB.put(key, JSON.stringify(lead), { metadata: leadMeta(lead) }); await idxSet(env, "lead", id, leadMeta(lead));
      return json({ ok: true });
    }
    if (req.method === "DELETE") { await env.DB.delete(key); await idxSet(env, "lead", id, null); return json({ ok: true }); }
  }

  if (thing === "quotes") {
    if (req.method === "GET" && !id) return json({ ok: true, quotes: (await listIdx(env, "quote")).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")) });
    if (req.method === "POST" && !id) {
      const n = (Number(await env.DB.get("counter:quote")) || 0) + 1;
      await env.DB.put("counter:quote", String(n));
      const qid = Date.now().toString(36) + "-" + rid(6);
      const q = { ...cleanQuote(body), id: qid, number: "Q-" + String(n).padStart(4, "0"), version: 1, createdAt: now(), updatedAt: now(), publicToken: rid(14), history: [] };
      q.history.push({ at: q.createdAt, version: 1, total: quoteTotals(q).total, note: "Created" });
      await saveQuote(env, qid, q);
      await env.DB.put("qpub:" + q.publicToken, qid);
      if (q.leadId) { const l = await env.DB.get("lead:" + q.leadId, "json"); if (l && l.status === "new") { l.status = "quoted"; await env.DB.put("lead:" + q.leadId, JSON.stringify(l), { metadata: leadMeta(l) }); await idxSet(env, "lead", q.leadId, leadMeta(l)); } }
      return json({ ok: true, quote: q });
    }
    const key = "quote:" + id;
    const q = await env.DB.get(key, "json");
    if (!q) return bad("Not found", 404);
    if (req.method === "GET") return json({ ok: true, quote: q });
    if (req.method === "PUT") {
      const before = quoteTotals(q).total;
      if (body.statusOnly) {
        if (!["draft", "sent", "accepted", "booked", "cancelled"].includes(body.status)) return bad("Unknown status");
        q.status = body.status;
        q.history.push({ at: now(), version: q.version, total: before, note: "Marked " + q.status });
        if (q.leadId && ["booked"].includes(q.status)) { const l = await env.DB.get("lead:" + q.leadId, "json"); if (l) { l.status = "booked"; await env.DB.put("lead:" + q.leadId, JSON.stringify(l), { metadata: leadMeta(l) }); await idxSet(env, "lead", q.leadId, leadMeta(l)); } }
      } else {
        const strip = (x) => JSON.stringify({ ...x, status: "" });
        const next = cleanQuote(body, q);
        const changed = strip(next) !== strip(cleanQuote(q, q));
        Object.assign(q, next);
        if (changed) {
          q.version += 1;
          const after = quoteTotals(q).total;
          q.history.push({ at: now(), version: q.version, total: after, note: before !== after ? `Amended (was ${inr(before)})` : "Amended" });
        }
      }
      q.history = q.history.slice(-30);
      q.updatedAt = now();
      await saveQuote(env, id, q);
      return json({ ok: true, quote: q });
    }
    if (req.method === "DELETE") { await env.DB.delete(key); await env.DB.delete("qpub:" + q.publicToken); await idxSet(env, "quote", id, null); return json({ ok: true }); }
  }

  if (thing === "reviews") {
    if (req.method === "GET" && !id) return json({ ok: true, reviews: (await listIdx(env, "review")).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")) });
    const write = async (rId, r, photo) => {
      if (photo !== undefined) {
        if (photo && /^data:image\/(jpeg|png|webp);base64,/.test(photo) && photo.length < 600000) { await env.DB.put("rphoto:" + rId, photo); r.hasPhoto = true; }
        else if (photo === "") { await env.DB.delete("rphoto:" + rId); r.hasPhoto = false; }
      }
      await env.DB.put("review:" + rId, JSON.stringify(r), { metadata: reviewMeta(r) });
      await idxSet(env, "review", rId, reviewMeta(r));
    };
    const fields = (b, prev = {}) => ({
      ...prev, name: clip(b.name ?? prev.name, 80), city: clip(b.city ?? prev.city, 60),
      event: clip(b.event ?? prev.event, 30) || "Wedding", date: clip(b.date ?? prev.date, 7),
      quote: clip(b.quote ?? prev.quote, 1200), rating: Math.min(5, Math.max(1, num(b.rating ?? prev.rating ?? 5))),
      source: clip(b.source ?? prev.source, 20), consent: !!(b.consent ?? prev.consent), published: !!(b.published ?? prev.published),
    });
    if (req.method === "POST" && !id) {
      const r = { ...fields(body), createdAt: now() };
      if (!r.name || !r.quote) return bad("Name and review text are needed");
      if (!r.consent) return bad("Please confirm the client gave permission to publish");
      const nid = Date.now().toString(36) + "-" + rid(6);
      await write(nid, r, body.photo);
      return json({ ok: true, id: nid });
    }
    const prev = await env.DB.get("review:" + id, "json");
    if (!prev) return bad("Not found", 404);
    if (req.method === "GET") return json({ ok: true, review: { id, ...prev } });
    if (req.method === "PUT") { const r = fields(body, prev); if (r.published && !r.consent) return bad("Permission is needed to publish"); await write(id, r, body.photo); return json({ ok: true }); }
    if (req.method === "DELETE") { await env.DB.delete("review:" + id); await env.DB.delete("rphoto:" + id); await idxSet(env, "review", id, null); return json({ ok: true }); }
  }
  return bad("Not found", 404);
}

// ---------------------------------------------------------------- public quote page
async function quotePage(env, token) {
  const qid = /^[a-z0-9]{14}$/.test(token) ? await env.DB.get("qpub:" + token) : null;
  const q = qid ? await env.DB.get("quote:" + qid, "json") : null;
  if (!q || q.status === "cancelled") return new Response("Quote not found", { status: 404, headers: { "content-type": "text/plain" } });
  const s = await getSettings(env);
  const t = quoteTotals(q);
  const date = q.weddingDate ? new Date(q.weddingDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";
  const accept = `https://wa.me/${s.studioWhatsapp}?text=${encodeURIComponent(`Hi ${STUDIO}! I'd like to accept quote ${q.number} (version ${q.version}) for ${q.client.name}${date ? ", wedding " + date : ""}. Total ${inr(t.total)}.`)}`;
  const ask = `https://wa.me/${s.studioWhatsapp}?text=${encodeURIComponent(`Hi ${STUDIO}, I have a question about quote ${q.number}.`)}`;
  const rows = q.items.map((i) => `<tr><td>${esc(i.label)}${i.note ? `<div class="n">${esc(i.note)}</div>` : ""}</td><td class="r">${i.qty}</td><td class="r">${inr(i.price)}</td><td class="r">${inr(i.qty * i.price)}</td></tr>`).join("");
  const html = `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Quote ${esc(q.number)} — ${STUDIO}</title>
<link rel="icon" href="/favicon.svg"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;600;700&family=Pinyon+Script&display=swap" rel="stylesheet">
<style>
:root{--m:#6b0f1a;--g:#c9a24a;--iv:#fbf7f2;--ink:#1e1419;--mute:#6f5f66}*{box-sizing:border-box}body{margin:0;background:var(--iv);color:var(--ink);font:16px/1.6 Manrope,system-ui,sans-serif}
.wrap{max-width:820px;margin:0 auto;padding:24px 16px 60px}.top{background:linear-gradient(160deg,#560c15,#3a070e);color:var(--iv);border-radius:24px;padding:28px 24px;position:relative;overflow:hidden}
.top h1{font:700 34px/1.1 'Cormorant Garamond',serif;margin:4px 0 0}.script{font-family:'Pinyon Script',cursive;color:#e6cf8f;font-size:28px}.meta{display:flex;flex-wrap:wrap;gap:8px 24px;margin-top:14px;font-size:14px;color:#f3e7e0}
.card{background:#fff;border:1px solid #0001;border-radius:20px;padding:20px;margin-top:16px;box-shadow:0 10px 30px -20px #6b0f1a55}
table{width:100%;border-collapse:collapse;font-size:15px}th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--mute);border-bottom:1px solid #0002;padding:8px 6px}td{border-bottom:1px solid #0001;padding:10px 6px;vertical-align:top}.r{text-align:right;white-space:nowrap}.n{font-size:13px;color:var(--mute)}
.tot{display:grid;grid-template-columns:1fr auto;gap:6px 16px;margin-top:14px;font-size:15px}.tot .big{font:700 26px 'Cormorant Garamond',serif;color:var(--m)}
.btn{display:block;text-align:center;border-radius:999px;padding:14px 18px;font-weight:700;text-decoration:none;margin-top:10px}.wa{background:#25d366;color:#fff}.gh{border:1px solid #0002;color:var(--ink);background:#fff}
.terms{font-size:13.5px;color:var(--mute)}h2{font:700 22px 'Cormorant Garamond',serif;margin:0 0 8px}.v{font-size:12px;color:#e6cf8f}
@media print{.btn,.noprint{display:none}body{background:#fff}.top{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="wrap">
<div class="top"><div class="script">${STUDIO}</div><h1>Your wedding quote</h1><div class="v">${esc(q.number)} · version ${q.version} · updated ${new Date(q.updatedAt).toLocaleDateString("en-IN")}</div>
<div class="meta"><span><b>For:</b> ${esc(q.client.name)}</span>${date ? `<span><b>Wedding:</b> ${esc(date)}</span>` : ""}${q.city ? `<span><b>City:</b> ${esc(q.city)}</span>` : ""}${q.venue ? `<span><b>Venue:</b> ${esc(q.venue)}</span>` : ""}</div></div>
<div class="card"><h2>What’s included</h2><table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<div class="tot"><span>Subtotal</span><span class="r">${inr(t.subtotal)}</span>${num(q.discount) ? `<span>Discount</span><span class="r">− ${inr(q.discount)}</span>` : ""}<span><b>Total</b></span><span class="r big">${inr(t.total)}</span>${num(q.advance) ? `<span>Advance to confirm your date</span><span class="r"><b>${inr(q.advance)}</b></span><span>Balance before the wedding</span><span class="r">${inr(t.balance)}</span>` : ""}</div></div>
${q.events ? `<div class="card"><h2>Events</h2><p style="margin:0">${esc(q.events)}</p></div>` : ""}
${q.notes ? `<div class="card"><h2>Notes</h2><p style="margin:0;white-space:pre-line">${esc(q.notes)}</p></div>` : ""}
<div class="card noprint"><a class="btn wa" href="${accept}">✓ Accept this quote on WhatsApp</a><a class="btn gh" href="${ask}">Ask a question</a><a class="btn gh" href="javascript:window.print()">Save / print as PDF</a></div>
<p class="terms">${esc(s.quoteTerms)}</p></div></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

// ---------------------------------------------------------------- public API
async function publicApi(req, env, path) {
  if (path === "/api/public/settings") {
    const s = await getSettings(env);
    return json({ ok: true, showPrices: s.showPricesOnSite, prices: s.showPricesOnSite ? s.prices.filter((p) => p.price > 0).map(({ key, label, price, unit }) => ({ key, label, price, unit })) : [], whatsapp: s.studioWhatsapp }, 200, { "cache-control": "public, max-age=60" });
  }
  if (path === "/api/public/reviews") {
    const metas = (await listIdx(env, "review")).filter((r) => r.published);
    const full = await Promise.all(metas.slice(0, 200).map(async (m) => ({ id: m.id, ...(await env.DB.get("review:" + m.id, "json")) })));
    return json({ ok: true, reviews: full.filter((r) => r.published && r.consent).map(({ id, name, city, event, date, quote, rating, source, hasPhoto, createdAt }) => ({ id, name, city, event, date, quote, rating, source, createdAt, photo: hasPhoto ? `/api/public/review-photo/${id}` : null })) }, 200, { "cache-control": "public, max-age=60" });
  }
  const m = path.match(/^\/api\/public\/review-photo\/([a-z0-9-]+)$/);
  if (m) {
    const r = await env.DB.get("review:" + m[1], "json");
    const data = r?.published && r?.consent ? await env.DB.get("rphoto:" + m[1]) : null;
    if (!data) return new Response("Not found", { status: 404 });
    const [, mime, b64] = data.match(/^data:(image\/[a-z]+);base64,(.*)$/) || [];
    return new Response(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), { headers: { "content-type": mime, "cache-control": "public, max-age=3600" } });
  }
  return bad("Not found", 404);
}

// ---------------------------------------------------------------- redirects + router
const REDIRECTS = {
  "/book": "/contact/", "/booking": "/contact/", "/enquire": "/contact/",
  "/bride": "/bridal-makeup/", "/bridal": "/bridal-makeup/", "/groom": "/groom-makeup/",
  "/prices": "/packages/", "/pricing": "/packages/", "/gallery": "/portfolio/",
  "/reviews": "/testimonials/", "/locations": "/areas/", "/login": "/admin/", "/studio": "/admin/",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path === "/api/lead" && request.method === "POST") return await handleLead(request, env);
      if (path.startsWith("/api/admin/")) return await admin(request, env, path);
      if (path.startsWith("/api/public/")) return await publicApi(request, env, path);
      const qm = path.match(/^\/q\/([a-z0-9]+)\/?$/);
      if (qm) return await quotePage(env, qm[1]);
    } catch (e) {
      console.log("error", path, e && e.stack);
      return bad("Something went wrong", 500);
    }
    const p = path.replace(/\/$/, "");
    if (REDIRECTS[p]) return Response.redirect(url.origin + REDIRECTS[p], 301);
    return env.ASSETS.fetch(request);
  },
};
