// Cloudflare Worker: serves the static Astro site + handles POST /api/lead.
//
// The booking form's PRIMARY channel is WhatsApp (opens a pre-filled chat).
// As a backup it also POSTs here, and if SES credentials are configured as
// Worker secrets (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / SES_REGION /
// LEAD_TO) the enquiry is emailed too. With no secrets set this endpoint
// answers 503 and the form silently carries on with WhatsApp — nothing breaks.
import { AwsClient } from "aws4fetch";

const FROM_ADDRESS = "noreply@zeabyte.co.nz"; // SES-verified domain
const DEFAULT_TO = "parminder@zeabyte.co.nz"; // until the business mailbox exists

const esc = (s) => String(s || "").slice(0, 1500);

async function handleLead(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (data.botcheck) return Response.json({ ok: true }); // honeypot

  const name = esc(data.name);
  const phone = esc(data.phone);
  if (!name || !phone) {
    return Response.json({ ok: false, error: "missing fields" }, { status: 400 });
  }
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    return Response.json({ ok: false, error: "email not configured" }, { status: 503 });
  }

  const region = env.SES_REGION || "ap-southeast-2";
  const aws = new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    service: "ses",
    region,
  });

  const body = [
    "New booking enquiry from the website",
    "",
    `Name:          ${name}`,
    `Phone/WhatsApp:${phone}`,
    `Wedding date:  ${esc(data.date) || "(not given)"}`,
    `City / venue:  ${esc(data.city) || "(not given)"}`,
    `For:           ${esc(data.who) || "(not given)"}`,
    `Events:        ${esc(data.events) || "(not given)"}`,
    "",
    "Message:",
    esc(data.message) || "(none)",
  ].join("\n");

  const res = await aws.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      FromEmailAddress: `RK Bridal Studio website <${FROM_ADDRESS}>`,
      Destination: { ToAddresses: [env.LEAD_TO || DEFAULT_TO] },
      Content: {
        Simple: {
          Subject: { Data: `💍 Booking enquiry — ${name} (${esc(data.date) || "date TBC"})` },
          Body: { Text: { Data: body } },
        },
      },
    }),
  });
  if (!res.ok) {
    console.log("SES error", res.status, await res.text());
    return Response.json({ ok: false, error: "send failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}

// Friendly short URLs → canonical pages.
const REDIRECTS = {
  "/book": "/contact/",
  "/booking": "/contact/",
  "/enquire": "/contact/",
  "/bride": "/bridal-makeup/",
  "/bridal": "/bridal-makeup/",
  "/groom": "/groom-makeup/",
  "/prices": "/packages/",
  "/pricing": "/packages/",
  "/gallery": "/portfolio/",
  "/reviews": "/testimonials/",
  "/locations": "/areas/",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead" && request.method === "POST") {
      return handleLead(request, env);
    }
    const path = url.pathname.replace(/\/$/, "");
    if (REDIRECTS[path]) return Response.redirect(url.origin + REDIRECTS[path], 301);
    return env.ASSETS.fetch(request);
  },
};
