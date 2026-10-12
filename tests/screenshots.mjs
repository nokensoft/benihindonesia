// Mengambil tangkapan layar halaman utama untuk tinjauan visual: node tests/screenshots.mjs
// Hasil: test-results/screenshots/*.png
import { mkdirSync } from 'node:fs';
import { BASE, startServer, launchBrowser } from './helpers.mjs';

const out = 'test-results/screenshots';
mkdirSync(out, { recursive: true });

const server = await startServer();
const browser = await launchBrowser();
try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
        const page = await browser.newPage({ viewport });
        const wait = (ms) => page.waitForTimeout(ms);

        // Beranda: setiap slide
        await page.goto(`${BASE}/`);
        await wait(1500);
        await page.screenshot({ path: `${out}/${name}-home-slide1.png` });
        await page.click('[data-slide-next]');
        await wait(1500);
        await page.screenshot({ path: `${out}/${name}-home-slide2.png` });
        await page.click('[data-slide-next]');
        await wait(1500);
        await page.screenshot({ path: `${out}/${name}-home-slide3.png` });

        // Tentang: linimasa
        await page.goto(`${BASE}/about/#journey`);
        await wait(1800);
        await page.screenshot({ path: `${out}/${name}-about-journey.png` });

        // Program: flip card
        await page.goto(`${BASE}/programmes/`);
        await wait(1200);
        await page.evaluate(() => document.querySelector('.flip-card').scrollIntoView({ block: 'center' }));
        await wait(1200);
        await page.screenshot({ path: `${out}/${name}-programmes-front.png` });
        await page.click('.flip-card >> nth=1');
        await wait(1200);
        await page.screenshot({ path: `${out}/${name}-programmes-flipped.png` });

        // Dampak
        await page.goto(`${BASE}/impact/`);
        await wait(1500);
        await page.screenshot({ path: `${out}/${name}-impact.png`, fullPage: true });

        // Cerita: peta pada beberapa titik scroll
        await page.goto(`${BASE}/stories/`);
        await wait(800);
        const top = await page.evaluate(() => document.querySelector('[data-scroll-map]').getBoundingClientRect().top + window.scrollY);
        const travel = await page.evaluate(() => {
            const r = document.querySelector('[data-scroll-map]');
            return r.offsetHeight - document.querySelector('[data-map-stage]').offsetHeight;
        });
        for (const [label, p] of [['0', 0.02], ['1', 0.35], ['2', 0.6], ['3', 1]]) {
            await page.evaluate((y) => window.scrollTo(0, y), top - (name === 'mobile' ? 64 : 80) + travel * p);
            await wait(600);
            await page.screenshot({ path: `${out}/${name}-map-${label}.png` });
        }
        await page.close();
    }
} finally {
    await browser.close();
    server.stop();
}
console.log(`Selesai: ${out}`);
