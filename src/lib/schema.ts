import { SITE } from "../config";

export const faqSchema = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const breadcrumbSchema = (crumbs: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: new URL(c.path, SITE.url).href,
  })),
});

export const serviceSchema = (opts: { name: string; description: string; path: string; areaServed?: string[] }) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: opts.name,
  serviceType: opts.name,
  description: opts.description,
  url: new URL(opts.path, SITE.url).href,
  provider: { "@id": `${SITE.url}/#business` },
  areaServed: (opts.areaServed || [SITE.city, SITE.state]).map((n) => ({ "@type": "Place", name: n })),
});

export const articleSchema = (opts: { title: string; description: string; path: string; date: Date; updated?: Date; image: string }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: opts.title,
  description: opts.description,
  image: new URL(opts.image, SITE.url).href,
  datePublished: opts.date.toISOString(),
  dateModified: (opts.updated || opts.date).toISOString(),
  author: { "@type": "Organization", name: SITE.name, url: SITE.url },
  publisher: { "@id": `${SITE.url}/#business` },
  mainEntityOfPage: new URL(opts.path, SITE.url).href,
});
