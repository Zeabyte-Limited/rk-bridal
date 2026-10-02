# Ops & incident history — rk-bridal

Every production change, issue and fix goes here (newest first).

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
