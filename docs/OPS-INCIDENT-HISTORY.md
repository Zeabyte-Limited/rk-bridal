# Ops & incident history — rk-bridal

Every production change, issue and fix goes here (newest first).

## 2026-10-04 — Back to v2 videos; no community labels (owner + sister feedback)

- Magnific (v3/v4) footage judged AI-looking and "terrible"; restored the v2 photo-reel hero videos (Sardar grooms,
  Sikh/Punjabi couples, dhol/bhangra clips) from commit 275ea00. ?v=5 cache-bust.
- Sister's rule: never separate or label Sikh vs Hindu. Deleted /sikh-wedding-makeup/ and /hindu-punjabi-wedding-makeup/
  (301 → /bridal-makeup/), removed the homepage Communities block, rewrote all "Sikh and Hindu Punjabi" copy to
  "Punjabi". Rituals still named naturally. Imagery target ~80% Sikh. CLAUDE.md audience rule updated.

## 2026-10-03 — Hero videos v4: Sikh couples & families on every page (owner request)

- Owner: all videos must show Sikh/Sardar couples and Sikh families, EXCEPT the Hindu Punjabi page.
- v3 Hindu-looking reel kept as `hero-hindu` (Hindu Punjabi page only). All other reels rebuilt: Sikh couple / Sardar
  groom / Sikh family photos (Magnific premium + Pexels, slow-zoom) + Sikh clips (bhangra, turban tying, groom in
  turban, father-son, grandfather) + Golden Temple. Videos cache-busted with ?v=4.

## 2026-10-03 — Hero videos v3 from Magnific (Freepik) Premium footage

- 26 real wedding clips (Punjabi/North Indian couples, safa/turban tying, ghodi, chooda bride, dhol, bhangra, artist doing
  bridal makeup) downloaded via the Magnific API (stock downloads free on the Premium plan, 100/day), cut to 3.4 s,
  crossfaded into 6 reels (desktop 1280x720 ≤4.1 MB, mobile 540x960 ≤2 MB). Areas reel unchanged (Golden Temple).

## 2026-10-03 — Sikh/Hindu Punjabi refocus + studio admin

- Owner instruction: Sikh Punjabi and Hindu Punjabi weddings ONLY. Copy rewritten (rituals: chunni chadana, maiyan,
  jaggo, choora, kaleere, sehra bandi, ghodi, laavan, pheras); new pages /sikh-wedding-makeup/ and
  /hindu-punjabi-wedding-makeup/; nav updated; dandiya + western-groom photos removed; 77 new Pexels photos (Sikh
  couples, Sardar + Hindu Punjabi grooms, chooda/kaleere brides, bridal hairstyles); hero videos rebuilt as reels of
  Sikh/Punjabi couple photos (slow zoom) + real dhol / bhangra / chooda-bride clips.
- Studio admin at /admin/ (enquiries, quotes with versions + client link, WhatsApp templates, reviews, prices).
  KV namespace rk-bridal-data. Password hash (PBKDF2) in KV key `auth`; login rate-limited; same-origin check.
- Bugs found in browser testing and fixed same day: (1) admin styles were Astro-scoped → `is:global`; (2) DELETE was
  rejected by the JSON-only check; (3) `/q/<token>/` showed the 404 page on browser navigation because static
  assets answered first → `run_worker_first: true`; (4) KV `list()` lags ~60 s → per-collection index keys.

## 2026-10-02 — CI fix + first live deploy via API

- First two Actions runs failed in 0 s ("workflow file issue"): `secrets` is not allowed in a step `if`, and
  `cloudflare/wrangler-action` was dropped in favour of plain `npx wrangler deploy`. Now: build always runs; deploy
  step runs only when `CLOUDFLARE_API_TOKEN` is set (checked via a step output).
- Live deploys so far were done from the dev box with `scripts/deploy-api.py` (wrangler cannot run on Windows-ARM).
- Mobile header overflow fixed: `.btn`/`.card` etc. moved under `@layer components` so Tailwind's `hidden` wins.
- Daily blog routine created: `trig_01DPXcFzeCLz5DkcwqPfZVo5`, 21:00 UTC daily.

## 2026-10-02 — Site built and first deploy

- Built from scratch: Astro 6 + Tailwind v4, 36+ pages (home, bridal, groom, services, packages, portfolio, reviews,
  about, 12 area pages, 8 blog posts, contact, FAQ, privacy, 404), full JSON-LD (BeautySalon/LocalBusiness, Service,
  FAQPage, Article, Breadcrumb), sitemap, robots, llms.txt, OG image, favicon set.
- Hero videos: 7 Pexels clips → 1280×720 ≈10 s H.264 (≤2.3 MB) + 540×960 mobile variants; posters as webp.
- Hosting: Cloudflare Worker `rk-bridal` (account "Zeabyte@zeabyte.co.nz's Account", free plan), static assets from
  `dist/`, `/api/lead` SES backup (secrets NOT set yet — form uses WhatsApp).
- CI/CD: GitHub `Zeabyte-Limited/rk-bridal` (public → free Actions minutes), `deploy.yml` runs
  `npm ci && npm run build && wrangler deploy` with repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.
- Placeholders still live: WhatsApp number, email, Instagram URL (all in `src/config.ts`); business name "RK Bridal Studio".
- Decision: NO fabricated testimonials. Reviews page ships with an honest empty state; `/preview/testimonials/` (noindex)
  shows the filled design with labelled samples.
