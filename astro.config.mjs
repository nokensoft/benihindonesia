// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    site: 'https://benihindonesia.org',
    // Clean URLs: /about/ is served from about/index.html
    trailingSlash: 'always',
    build: {
        format: 'directory',
    },
    integrations: [
        sitemap({
            filter: (page) => !page.includes('/404'),
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
