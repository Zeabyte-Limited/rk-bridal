import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog posts = Markdown files in src/content/blog/<slug>.md
// The daily blog agent adds ONE file per day here — no code changes needed.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(["Bridal", "Groom", "Planning", "Trends", "Skin & Hair", "Local"]).default("Bridal"),
    image: z.string().default("hero-wide"), // key in public/images
    imageAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
