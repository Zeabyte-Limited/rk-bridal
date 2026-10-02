# RK Bridal Studio — website

Bridal & groom makeup artist website for Jalandhar, Punjab. Built with **Astro 6 + Tailwind v4**, hosted on a
**Cloudflare Worker** (free plan) that serves the static build and handles the booking-form email backup.

- **Live:** https://rk-bridal.zeabyte.workers.dev (custom domain to be attached once bought — see `docs/NAME-OPTIONS.md`)
- **Repo:** `Zeabyte-Limited/rk-bridal` — **push to `main` = live** in ~90 s (`.github/workflows/deploy.yml`)
- **Owner:** Parminder (Zeabyte) manages the site for the studio.

## Change the business details (name, phone, WhatsApp, Instagram, email)

Everything reads from **`src/config.ts`**. Edit that one file, push, done. The WhatsApp number there is a
placeholder until the real one is supplied — every WhatsApp button on the site uses it.

## Add a blog post (or let the daily agent do it)

Drop a Markdown file in `src/content/blog/<slug>.md` with this frontmatter:

```md
---
title: "…"
description: "… (max 170 chars)"
date: 2026-10-05
category: "Bridal"      # Bridal | Groom | Planning | Trends | Skin & Hair | Local
image: "bride-red-kaleere"   # a key from public/images (no extension)
tags: ["…"]
faqs:
  - q: "…"
    a: "…"
---
Body in Markdown…
```

The post appears at `/blog/<slug>/` with Article + FAQ schema, and in the sitemap. See `CLAUDE.md` for the
daily blog agent's rules.

## Add real reviews

`src/data/testimonials.ts` — one entry per real review (with permission). Photos in `public/images/clients/`.
The live site renders **only** entries in that file. `/preview/testimonials/` shows the filled design with
labelled samples (noindex, unlinked) — delete it once real reviews are live.

## Replace the stock photos

Launch photos/videos are Pexels stock placeholders (`docs/IMAGE-CREDITS.md`). Replace them with the studio's
own work by dropping files with the same names in `public/images/` (`name.webp` ≈1400px + `name-sm.webp`
≈640px) and `public/videos/` (`hero-*.mp4` 1280×720 ≈10 s muted + `hero-*-mobile.mp4` 540×960).

## Local dev

```bash
npm install --ignore-scripts   # wrangler's workerd has no Windows-ARM build; CI deploys
npm run dev                    # http://localhost:4321
npm run build                  # static build → dist/
```

## Booking form email backup (optional)

The form opens WhatsApp. It also POSTs to `/api/lead`; if these Worker secrets are set the enquiry is emailed
via Amazon SES too: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_REGION` (ap-southeast-2), `LEAD_TO`.
Without them the endpoint returns 503 and nothing breaks.

## Docs

- `docs/NAME-OPTIONS.md` — business-name shortlist + domain availability
- `docs/CONTENT-GUIDE.md` — for the studio team: photos, reviews, what not to claim
- `docs/IMAGE-CREDITS.md` — stock sources
- `docs/OPS-INCIDENT-HISTORY.md` — every prod change / issue
