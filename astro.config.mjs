// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Switch to the custom domain once it is bought + attached to the Worker.
  site: 'https://rk-bridal.zeabyte.workers.dev',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/preview/'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
