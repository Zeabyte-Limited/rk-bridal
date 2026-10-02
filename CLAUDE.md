# CLAUDE.md — rk-bridal (RK Bridal Studio website)

Bridal & groom makeup artist website, Jalandhar, Punjab. Astro 6 + Tailwind v4 → Cloudflare Worker. **Push to `main` deploys.**
Owner: Parminder (Zeabyte) manages it for his sister's studio. Read `README.md` and `docs/` first.

## Non-negotiable truth rules

- **Never invent reviews, client names, awards, years of experience, celebrity clients, certifications or prices.**
  Reviews come ONLY from `src/data/testimonials.ts` (real, permissioned). Keep the empty state honest.
- Stock photos/videos are placeholders; captions describe looks, never named clients.
- No prices on the site until a rate card exists (`packages.astro` price fields are blank on purpose).
- Keep every WhatsApp/phone/email reference going through `src/config.ts`.

## Daily blog agent — rules

Goal: one strong, genuinely useful post per day that a Punjabi bride/groom would search for, driving WhatsApp enquiries.

1. Read `src/content/blog/` first; **never duplicate a topic**. Keep a candidate queue + done list in `seo-log.md`.
2. Write `src/content/blog/<kebab-slug>.md` with the frontmatter in `README.md`. 700–1,200 words, specific to Punjab
   (Jalandhar, Chandigarh, Ludhiana, Amritsar, weather, ceremonies: roka, sagan, mehndi, haldi, sangeet, Anand Karaj,
   pheras, reception, doli). 2–4 FAQs in frontmatter. Link to 2+ existing pages (`/bridal-makeup/`, `/groom-makeup/`,
   `/packages/`, `/areas/<city>/`, another post). Use an existing image key from `public/images/`.
3. Categories: Bridal · Groom · Planning · Trends · Skin & Hair · Local. Rotate; local-intent posts (venues, seasons,
   city-specific) are high value.
4. Tone: warm, expert, honest, no hype, no fake statistics, no made-up client stories. Indian English, ₹ for money.
5. `npm run build` must pass. Then commit (`blog: <title>`) and push to `main`. Append a line to `seo-log.md`.
6. Allowed beyond the post: fix a broken link, improve a meta description, add an internal link. **Do NOT** touch
   `src/config.ts`, `worker.js`, `wrangler.jsonc`, `deploy.yml`, testimonials, packages/prices, or the design.
7. One change-set per day. If no good topic exists, skip the post and do one small SEO fix instead.

## Dev notes

- Windows-ARM dev box: `npm install --ignore-scripts` (wrangler's workerd has no arm64 build). Deploys run in CI only.
- Images: `public/images/<key>.webp` (~1400px) + `<key>-sm.webp` (~640px). Videos: `public/videos/hero-*.mp4` + `-mobile`.
- Record every prod change in `docs/OPS-INCIDENT-HISTORY.md`.
