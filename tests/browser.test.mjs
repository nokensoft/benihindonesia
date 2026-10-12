// Pengujian perilaku di browser (Chrome/Edge) terhadap hasil build: slider, efek scroll, flip card,
// peta scroll-driven, formulir, responsif, "reduce motion", tanpa JavaScript, dan aksesibilitas (axe-core).
//   npm run build && npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { BASE, startServer, launchBrowser } from './helpers.mjs';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

let server;
let browser;

before(async () => {
    server = await startServer();
    browser = await launchBrowser();
});

after(async () => {
    await browser?.close();
    server?.stop();
});

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Membuka halaman di konteks baru; mengumpulkan galat konsol/halaman milik situs sendiri. */
async function open(path, { viewport = DESKTOP, reducedMotion, javaScriptEnabled = true, clock = false } = {}) {
    const context = await browser.newContext({ viewport, reducedMotion, javaScriptEnabled });
    const page = await context.newPage();
    const problems = [];
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
        if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|ERR_(NAME|INTERNET|CONNECTION)/.test(m.text())) problems.push(`console: ${m.text()}`);
    });
    page.on('response', (r) => {
        if (r.url().startsWith(BASE) && r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`);
    });
    if (clock) await page.clock.install();
    await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
    return { page, context, problems, close: () => context.close() };
}

const activeSlide = (page) => page.evaluate(() => [...document.querySelectorAll('[data-slide]')].findIndex((s) => s.getAttribute('data-active') === 'true'));
const settle = (page, ms = 1100) => page.waitForTimeout(ms);

// ---------------------------------------------------------------------------------------------
// Beranda: slider
// ---------------------------------------------------------------------------------------------
test('Beranda: slider tampil, tombol berikutnya/sebelumnya/titik berfungsi', async () => {
    const { page, problems, close } = await open('/');
    try {
        assert.equal(await page.locator('[data-slide]').count(), 3);
        assert.equal(await activeSlide(page), 0);
        assert.match((await page.locator('h1').innerText()).replace(/\s+/g, ' '), /Better Education\. Brighter Future/);

        await page.click('[data-slide-next]');
        assert.equal(await activeSlide(page), 1);
        await page.click('[data-slide-next]');
        assert.equal(await activeSlide(page), 2);
        await page.click('[data-slide-next]');
        assert.equal(await activeSlide(page), 0, 'berputar kembali ke slide pertama');
        await page.click('[data-slide-prev]');
        assert.equal(await activeSlide(page), 2, 'sebelumnya dari slide pertama ke slide terakhir');
        await page.locator('[data-slide-dot]').nth(1).click();
        assert.equal(await activeSlide(page), 1);

        // slide tidak aktif tidak bisa difokus & disembunyikan dari pembaca layar
        const states = await page.evaluate(() => [...document.querySelectorAll('[data-slide]')].map((s) => ({ hidden: s.getAttribute('aria-hidden'), inert: s.hasAttribute('inert'), visible: getComputedStyle(s).visibility })));
        assert.deepEqual(states.map((s) => s.hidden), ['true', 'false', 'true']);
        assert.deepEqual(states.map((s) => s.inert), [true, false, true]);
        await settle(page);
        assert.deepEqual((await page.evaluate(() => [...document.querySelectorAll('[data-slide]')].map((s) => getComputedStyle(s).visibility))), ['hidden', 'visible', 'hidden']);
        assert.deepEqual(problems, []);
    } finally {
        await close();
    }
});

test('Beranda: slider berganti otomatis, dapat dijeda, dan jeda saat disorot', async () => {
    const { page, close } = await open('/', { clock: true });
    try {
        assert.equal(await activeSlide(page), 0);
        await page.clock.fastForward(7100);
        assert.equal(await activeSlide(page), 1, 'autoplay maju setelah ±7 detik');

        await page.click('[data-slide-toggle]');
        assert.equal(await page.getAttribute('[data-slide-toggle]', 'aria-pressed'), 'true');
        await page.mouse.move(5, 5); // keluar dari area slider
        await page.clock.fastForward(21000);
        assert.equal(await activeSlide(page), 1, 'tidak maju saat dijeda');

        await page.click('[data-slide-toggle]');
        assert.equal(await page.getAttribute('[data-slide-toggle]', 'aria-pressed'), 'false');
        await page.evaluate(() => document.activeElement?.blur());
        await page.mouse.move(5, 5);
        await page.clock.fastForward(7100);
        assert.equal(await activeSlide(page), 2, 'lanjut setelah dilanjutkan');

        // sorot kursor: berhenti
        await page.mouse.move(600, 300);
        await page.clock.fastForward(21000);
        assert.equal(await activeSlide(page), 2, 'tidak maju saat kursor di atas slider');
    } finally {
        await close();
    }
});

test('Beranda: keyboard panah kiri/kanan mengganti slide', async () => {
    const { page, close } = await open('/');
    try {
        await page.focus('[data-slide-next]');
        await page.keyboard.press('ArrowRight');
        assert.equal(await activeSlide(page), 1);
        await page.keyboard.press('ArrowLeft');
        assert.equal(await activeSlide(page), 0);
    } finally {
        await close();
    }
});

test('Beranda: video latar slide 1 diputar saat aktif, berhenti saat pindah slide atau dijeda', async () => {
    const { page, problems, close } = await open('/');
    const paused = () => page.evaluate(() => document.querySelector('[data-hero-video]').paused);
    try {
        await page.waitForFunction(() => !document.querySelector('[data-hero-video]').paused, null, { timeout: 10000 });
        await page.click('[data-slide-next]');
        assert.equal(await paused(), true, 'berhenti saat slide 1 tidak aktif');
        await page.click('[data-slide-prev]');
        await page.waitForFunction(() => !document.querySelector('[data-hero-video]').paused, null, { timeout: 5000 });
        await page.click('[data-slide-toggle]');
        assert.equal(await paused(), true, 'tombol jeda ikut menjeda video');
        assert.deepEqual(problems, []);
    } finally {
        await close();
    }
});

test('Beranda: "reduce motion" tidak memutar video latar (poster tampil)', async () => {
    const { page, close } = await open('/', { reducedMotion: 'reduce' });
    try {
        await settle(page);
        const state = await page.evaluate(() => {
            const v = document.querySelector('[data-hero-video]');
            return { paused: v.paused, poster: v.getAttribute('poster') };
        });
        assert.equal(state.paused, true);
        assert.match(state.poster, /hero-slide-1-poster\.jpg$/);
    } finally {
        await close();
    }
});

test('Beranda: "reduce motion" mematikan autoplay', async () => {
    const { page, close } = await open('/', { reducedMotion: 'reduce', clock: true });
    try {
        await page.clock.fastForward(30000);
        assert.equal(await activeSlide(page), 0);
        assert.equal(await page.getAttribute('[data-slide-toggle]', 'aria-pressed'), 'true');
        await page.click('[data-slide-next]');
        assert.equal(await activeSlide(page), 1, 'navigasi manual tetap berfungsi');
    } finally {
        await close();
    }
});

test('Beranda: swipe di layar sentuh mengganti slide', async () => {
    const context = await browser.newContext({ viewport: MOBILE, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    try {
        await page.goto(`${BASE}/`);
        const swipe = (from, to) =>
            page.evaluate(([a, b]) => {
                const el = document.querySelector('[data-hero-slider]');
                const mk = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 300 });
                el.dispatchEvent(new TouchEvent('touchstart', { touches: [mk(a)], changedTouches: [mk(a)], bubbles: true }));
                el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [mk(b)], bubbles: true }));
            }, [from, to]);
        await swipe(300, 80);
        assert.equal(await activeSlide(page), 1, 'geser ke kiri = berikutnya');
        await swipe(80, 300);
        assert.equal(await activeSlide(page), 0, 'geser ke kanan = sebelumnya');
    } finally {
        await context.close();
    }
});

// ---------------------------------------------------------------------------------------------
// Efek blur reveal (Tentang)
// ---------------------------------------------------------------------------------------------
test('Tentang: tahun & target capaian blur-reveal saat masuk layar', async () => {
    const { page, problems, close } = await open('/about/');
    try {
        const state = () =>
            page.evaluate(() =>
                [...document.querySelectorAll('#journey [data-reveal="blur"]')].map((el) => {
                    const cs = getComputedStyle(el);
                    return { opacity: Number(cs.opacity), filter: cs.filter, revealed: el.classList.contains('is-revealed') };
                }),
            );
        const before = await state();
        assert.equal(before.length, 6);
        assert.ok(before.every((s) => !s.revealed && s.opacity === 0 && /blur/.test(s.filter)), 'awalnya tersembunyi dan kabur');

        await page.evaluate(() => document.querySelector('#journey').scrollIntoView({ block: 'start' }));
        await page.evaluate(() => window.scrollBy(0, 150));
        await settle(page, 2000);
        const after = await state();
        assert.ok(after.slice(0, 4).every((s) => s.revealed && s.opacity === 1 && s.filter === 'none'), 'muncul jelas setelah masuk layar');
        assert.deepEqual(problems, []);
    } finally {
        await close();
    }
});

test('Tentang: blur-reveal dimatikan pada "reduce motion"', async () => {
    const { page, close } = await open('/about/', { reducedMotion: 'reduce' });
    try {
        const all = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every((el) => getComputedStyle(el).opacity === '1' && getComputedStyle(el).filter === 'none'));
        assert.ok(all);
    } finally {
        await close();
    }
});

test('Tanpa JavaScript: semua konten tetap terlihat (tidak ada yang tersembunyi efek)', async () => {
    for (const path of ['/', '/about/', '/impact/', '/programmes/']) {
        const { page, close } = await open(path, { javaScriptEnabled: false });
        try {
            const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity !== '1').length);
            assert.equal(hidden, 0, `${path}: elemen [data-reveal] tersembunyi tanpa JS`);
            if (path === '/') {
                const visible = await page.evaluate(() => getComputedStyle(document.querySelector('[data-slide]')).visibility);
                assert.equal(visible, 'visible', 'slide pertama tampil tanpa JS');
                const h1 = await page.evaluate(() => getComputedStyle(document.querySelector('h1')).opacity);
                assert.equal(h1, '1');
            }
        } finally {
            await close();
        }
    }
    const { page, close } = await open('/stories/', { javaScriptEnabled: false });
    try {
        const info = await page.evaluate(() => ({
            height: document.querySelector('[data-scroll-map]').offsetHeight,
            targets: [...document.querySelectorAll('[data-map-target]')].map((t) => getComputedStyle(t).opacity),
            vb: document.querySelector('[data-map-svg]').viewBox.baseVal.width,
        }));
        assert.ok(info.height < 1000, 'peta statis (tanpa JS) tidak memakai area scroll panjang');
        assert.ok(info.targets.every((o) => o === '1'), 'delapan wilayah terlihat tanpa JS');
        assert.ok(info.vb < 2500, 'tampilan peta tanpa JS = zoom ke Papua');
    } finally {
        await close();
    }
});

// ---------------------------------------------------------------------------------------------
// Flip card (Program)
// ---------------------------------------------------------------------------------------------
test('Program: flip card SDG membalik saat diklik, ditekan keyboard, dan disorot', async () => {
    const { page, problems, close } = await open('/programmes/');
    try {
        const cards = page.locator('.flip-card');
        assert.equal(await cards.count(), 3);
        const rotation = (i) =>
            page.evaluate((n) => {
                const inner = document.querySelectorAll('.flip-card__inner')[n];
                const m = new DOMMatrix(getComputedStyle(inner).transform);
                return Math.round(Math.atan2(m.m13 === 0 ? 0 : m.m13, m.m11) * (180 / Math.PI)) || (m.m11 < -0.99 ? 180 : 0);
            }, i);
        await cards.first().scrollIntoViewIfNeeded();
        await page.mouse.move(5, 5);
        await settle(page, 1500);

        // klik
        await cards.nth(1).click();
        await page.mouse.move(5, 5);
        await settle(page, 1200);
        assert.equal(await cards.nth(1).getAttribute('aria-pressed'), 'true');
        assert.equal(Math.abs(await rotation(1)), 180, 'kartu terbalik 180°');
        await cards.nth(1).click();
        await page.mouse.move(5, 5);
        await settle(page, 1200);
        assert.equal(await cards.nth(1).getAttribute('aria-pressed'), 'false');
        assert.equal(await rotation(1), 0, 'kembali ke depan');

        // keyboard
        await cards.nth(2).focus();
        await page.keyboard.press('Enter');
        assert.equal(await cards.nth(2).getAttribute('aria-pressed'), 'true');
        await page.keyboard.press('Space');
        assert.equal(await cards.nth(2).getAttribute('aria-pressed'), 'false');

        // hover (perangkat mouse)
        await cards.nth(0).hover();
        await settle(page, 1200);
        assert.equal(Math.abs(await rotation(0)), 180, 'berbalik saat disorot');
        await page.mouse.move(5, 5);
        await settle(page, 1200);
        assert.equal(await rotation(0), 0);

        // sisi belakang memuat teks SDG yang benar, sisi depan memuat gambar
        const texts = await page.evaluate(() => [...document.querySelectorAll('.flip-card__back')].map((b) => b.textContent.replace(/\s+/g, ' ').trim()));
        assert.match(texts[0], /^SDG 1: Tanpa Kemiskinan Mengentaskan segala bentuk kemiskinan/);
        assert.match(texts[1], /^SDG 4: Pendidikan Berkualitas Menjamin pendidikan berkualitas/);
        assert.match(texts[2], /^SDG 10: Berkurangnya Kesenjangan Mengurangi kesenjangan/);
        const imgs = await page.evaluate(() => [...document.querySelectorAll('.flip-card__front img')].map((i) => ({ ok: i.complete && i.naturalWidth > 0, alt: i.alt })));
        assert.ok(imgs.every((i) => i.ok), 'gambar SDG termuat');
        assert.deepEqual(imgs.map((i) => i.alt), ['SDG 1: Tanpa Kemiskinan', 'SDG 4: Pendidikan Berkualitas', 'SDG 10: Berkurangnya Kesenjangan']);
        assert.deepEqual(problems, []);
    } finally {
        await close();
    }
});

test('Program: flip card di layar sentuh (ketuk)', async () => {
    const context = await browser.newContext({ viewport: MOBILE, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    try {
        await page.goto(`${BASE}/programmes/`);
        const card = page.locator('.flip-card').first();
        await card.scrollIntoViewIfNeeded();
        await card.tap();
        assert.equal(await card.getAttribute('aria-pressed'), 'true');
        // sisi belakang tidak terpotong: teks muat dalam kartu
        await page.waitForTimeout(1200);
        const fits = await page.evaluate(() => {
            const back = document.querySelector('.flip-card__back');
            return back.scrollHeight <= back.clientHeight + 1;
        });
        assert.ok(fits, 'teks sisi belakang muat di kartu pada layar 390px');
    } finally {
        await context.close();
    }
});

// ---------------------------------------------------------------------------------------------
// Floating / lift-up (Dampak)
// ---------------------------------------------------------------------------------------------
test('Dampak: kartu melayang pelan, terangkat saat disorot, dan muncul dari bawah', async () => {
    const { page, problems, close } = await open('/impact/');
    try {
        const first = page.locator('.lift-card').first();
        await first.scrollIntoViewIfNeeded();
        await settle(page, 1500);
        const anim = await first.evaluate((el) => el.getAnimations().map((a) => a.animationName));
        assert.ok(anim.includes('lift-float'), 'animasi melayang berjalan');

        const ty = (el) => new DOMMatrix(getComputedStyle(el).transform).m42;
        const rest = await first.evaluate(ty);
        assert.equal(rest, 0);
        await first.hover();
        await settle(page, 700);
        assert.equal(await first.evaluate(ty), -10, 'terangkat 10px saat disorot');
        const shadow = await first.evaluate((el) => getComputedStyle(el).boxShadow);
        assert.match(shadow, /rgba?\(/);

        // kartu bagian bawah tersembunyi sebelum di-scroll, lalu muncul
        const lowerHidden = await page.evaluate(() => {
            const li = document.querySelectorAll('section')[1].querySelector('li[data-reveal]');
            return { revealed: li.classList.contains('is-revealed') };
        });
        assert.equal(lowerHidden.revealed, false);
        await page.evaluate(() => document.querySelectorAll('section')[1].scrollIntoView({ block: 'center' }));
        await settle(page, 1800);
        assert.equal(await page.evaluate(() => [...document.querySelectorAll('section')[1].querySelectorAll('li[data-reveal]')].every((li) => li.classList.contains('is-revealed'))), true);
        assert.deepEqual(problems, []);
    } finally {
        await close();
    }
});

test('Dampak: "reduce motion" mematikan animasi melayang', async () => {
    const { page, close } = await open('/impact/', { reducedMotion: 'reduce' });
    try {
        const running = await page.evaluate(() => [...document.querySelectorAll('.lift-card')].some((el) => el.getAnimations().some((a) => a.animationName === 'lift-float' && a.playState === 'running' && a.effect.getComputedTiming().duration > 1)));
        assert.equal(running, false);
    } finally {
        await close();
    }
});

// ---------------------------------------------------------------------------------------------
// Peta scroll-driven (Cerita)
// ---------------------------------------------------------------------------------------------
async function mapAt(page, p) {
    return page.evaluate(async (progress) => {
        const root = document.querySelector('[data-scroll-map]');
        const stage = root.querySelector('[data-map-stage]');
        const travel = root.offsetHeight - stage.offsetHeight;
        const top = root.getBoundingClientRect().top + window.scrollY;
        const headerH = document.querySelector('[data-site-header]').offsetHeight;
        window.scrollTo(0, top - headerH + travel * progress);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        await new Promise((r) => setTimeout(r, 150));
        const svg = root.querySelector('[data-map-svg]');
        const vb = svg.viewBox.baseVal;
        const op = (sel) => [...root.querySelectorAll(sel)].map((el) => Number(el.style.opacity || getComputedStyle(el).opacity));
        return {
            vbWidth: vb.width,
            vbX: vb.x,
            targets: op('[data-map-target]'),
            labels: op('[data-map-label]'),
            regencies: op('[data-map-regencies]')[0],
            beacon: op('[data-beacon]'),
            step: [...root.querySelectorAll('[data-map-step]')].findIndex((s) => s.getAttribute('data-active') === 'true'),
            sticky: getComputedStyle(stage).position,
        };
    }, p);
}

test('Cerita: peta bergerak dari Indonesia ke delapan wilayah di Papua mengikuti scroll', async () => {
    const { page, problems, close } = await open('/stories/');
    try {
        await page.waitForSelector('[data-scroll-map][data-ready="true"]');
        const start = await mapAt(page, 0);
        assert.equal(start.sticky, 'sticky');
        assert.ok(start.vbWidth > 4500, `awal menampilkan seluruh Indonesia (lebar viewBox ${start.vbWidth})`);
        assert.ok(start.targets.every((o) => o === 0), 'wilayah sasaran belum terlihat');
        assert.ok(start.labels.every((o) => o === 0), 'label belum terlihat');
        assert.ok(start.beacon.every((o) => o > 0.9), 'penanda berdenyut di Papua terlihat');
        assert.equal(start.step, 0);

        const mid = await mapAt(page, 0.45);
        assert.ok(mid.vbWidth < start.vbWidth && mid.vbWidth > 1500, 'zoom bertahap');
        assert.equal(mid.step, 1);
        assert.ok(mid.targets[mid.targets.length - 1] >= 0 && mid.targets.some((o) => o > 0), 'sebagian wilayah mulai muncul');

        const end = await mapAt(page, 1);
        assert.ok(end.vbWidth < 2200, `akhir memperbesar ke Papua (lebar viewBox ${end.vbWidth})`);
        assert.ok(end.vbWidth < start.vbWidth / 2);
        assert.ok(end.targets.every((o) => o === 1), 'delapan wilayah terlihat penuh');
        assert.equal(end.targets.length, 8);
        assert.ok(end.labels.every((o) => o === 1), 'semua label terlihat');
        assert.equal(end.regencies, 1, 'batas kabupaten terlihat');
        assert.ok(end.beacon.every((o) => o === 0), 'penanda awal memudar');
        assert.equal(end.step, 2);

        // kembali ke atas: transisi dapat dibalik
        const back = await mapAt(page, 0);
        assert.ok(Math.abs(back.vbWidth - start.vbWidth) < 1);
        assert.deepEqual(problems, []);
    } finally {
        await close();
    }
});

test('Cerita: warna wilayah sesuai revisi dan label tidak keluar dari layar', async () => {
    for (const viewport of [DESKTOP, MOBILE, { width: 768, height: 1024 }]) {
        const { page, close } = await open('/stories/', { viewport });
        try {
            await page.waitForSelector('[data-scroll-map][data-ready="true"]');
            await mapAt(page, 1);
            const info = await page.evaluate(() => {
                const fill = (role) => [...document.querySelectorAll(`[data-role="${role}"] path:first-child`)].map((p) => p.getAttribute('fill'));
                const vw = document.documentElement.clientWidth;
                const svgBox = document.querySelector('[data-map-svg]').getBoundingClientRect();
                const outside = [...document.querySelectorAll('.scroll-map__label')].map((t) => ({ text: t.textContent, r: t.getBoundingClientRect() })).filter(({ r }) => r.left < svgBox.left - 1 || r.right > Math.min(svgBox.right, vw) + 1 || r.top < svgBox.top || r.bottom > svgBox.bottom).map((o) => o.text);
                return { start: fill('start'), city: fill('city'), next: fill('next'), land: document.querySelector('[data-map-svg] > path').getAttribute('fill'), outside, overflowX: document.documentElement.scrollWidth - vw };
            });
            assert.deepEqual(info.start, ['#2563eb']);
            assert.deepEqual(info.city, ['#d9b88f']);
            assert.deepEqual(info.next, Array(6).fill('#facc15'));
            assert.equal(info.land, '#3f9d63');
            assert.deepEqual(info.outside, [], `label keluar layar pada ${viewport.width}px`);
            assert.ok(info.overflowX <= 0, `tidak ada scroll horizontal pada ${viewport.width}px`);
        } finally {
            await close();
        }
    }
});

test('Cerita: klik peta menuju linimasa 2026–2030 dan linimasa tampil', async () => {
    const { page, problems, close } = await open('/stories/');
    try {
        await page.waitForSelector('[data-scroll-map][data-ready="true"]');
        await mapAt(page, 1);
        const mapLink = page.locator('[data-map-svg]').locator('xpath=ancestor::a');
        assert.equal(await mapLink.getAttribute('href'), '/about/#journey');
        await page.mouse.click(DESKTOP.width / 2, DESKTOP.height / 2);
        await page.waitForURL('**/about/#journey');
        await settle(page, 2000);
        assert.match(await page.locator('#journey h2').innerText(), /Perjalanan Kami: 2026–2030/);
        const inView = await page.evaluate(() => {
            const r = document.querySelector('#journey').getBoundingClientRect();
            return r.top < window.innerHeight && r.bottom > 0;
        });
        assert.ok(inView, 'bagian linimasa terlihat di layar');
        assert.equal(await page.evaluate(() => document.querySelector('#journey-2026 [data-reveal]').classList.contains('is-revealed')), true);

        // tombol CTA di peta juga menuju linimasa
        await page.goto(`${BASE}/stories/`);
        const cta = page.getByRole('link', { name: /Lihat Perjalanan Kami 2026–2030$/ }).last();
        assert.equal(await cta.getAttribute('href'), '/about/#journey');
        assert.deepEqual(problems, []);
    } finally {
        await close();
    }
});

test('Cerita: "reduce motion" menampilkan peta statis di keadaan akhir', async () => {
    const { page, close } = await open('/stories/', { reducedMotion: 'reduce' });
    try {
        await page.waitForSelector('[data-scroll-map][data-ready="true"]');
        const info = await page.evaluate(() => ({
            static: document.querySelector('[data-scroll-map]').dataset.static,
            height: document.querySelector('[data-scroll-map]').offsetHeight,
            position: getComputedStyle(document.querySelector('[data-map-stage]')).position,
            targets: [...document.querySelectorAll('[data-map-target]')].map((t) => t.style.opacity),
            vb: document.querySelector('[data-map-svg]').viewBox.baseVal.width,
        }));
        assert.equal(info.static, 'true');
        assert.equal(info.position, 'relative');
        assert.ok(info.height < 1200);
        assert.ok(info.targets.every((o) => o === '1'));
        assert.ok(info.vb < 2200);
    } finally {
        await close();
    }
});

// ---------------------------------------------------------------------------------------------
// Navigasi, bahasa, formulir
// ---------------------------------------------------------------------------------------------
test('Navigasi: label Indonesia, halaman aktif ditandai, semua tautan menu bisa dibuka', async () => {
    const { page, problems, close } = await open('/');
    try {
        const labels = await page.locator('nav[aria-label="Navigasi utama"] a').allInnerTexts();
        assert.deepEqual(labels.map((l) => l.trim()), ['Beranda', 'Tentang', 'Program', 'Dampak', 'Cerita', 'Bahan Ajar', 'Kontak', 'Bergabung Bersama Kami']);
        const hrefs = await page.locator('nav[aria-label="Navigasi utama"] a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
        for (const href of hrefs) {
            const res = await page.goto(`${BASE}${href}`);
            assert.equal(res.status(), 200, href);
            const current = await page.locator('nav[aria-label="Navigasi utama"] a[aria-current="page"]').first().getAttribute('href');
            assert.equal(current, href, `menu aktif untuk ${href}`);
        }
        const notFound = await page.goto(`${BASE}/tidak-ada/`);
        assert.equal(notFound.status(), 404);
        assert.match(await page.locator('h1').innerText(), /Halaman tidak ditemukan/);
        assert.equal(problems.filter((p) => !/404/.test(p)).length, 0, problems.join('\n'));
    } finally {
        await close();
    }
});

test('Menu seluler: buka/tutup dengan label Indonesia dan Escape', async () => {
    const { page, close } = await open('/', { viewport: MOBILE });
    try {
        const toggle = page.locator('[data-menu-toggle]');
        assert.equal(await toggle.getAttribute('aria-label'), 'Buka menu');
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        assert.equal(await toggle.getAttribute('aria-label'), 'Tutup menu');
        assert.ok(await page.locator('#mobile-menu').isVisible());
        const items = await page.locator('#mobile-menu a').allInnerTexts();
        assert.ok(items.includes('Bahan Ajar') && items.includes('Bergabung Bersama Kami'));
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    } finally {
        await close();
    }
});

test('Bahasa: tombol ID/EN mengatur cookie googtrans', async () => {
    const { page, context, close } = await open('/');
    try {
        assert.equal(await page.locator('[data-lang-switch] [data-lang="id"]').first().getAttribute('aria-pressed'), 'true');
        // Jaringan ke Google dicegat agar pengujian tidak bergantung pada internet
        await context.route('https://translate.google.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
        await Promise.all([page.waitForNavigation(), page.locator('[data-lang-switch] [data-lang="en"]').first().click()]);
        const cookies = await context.cookies();
        assert.ok(cookies.some((c) => c.name === 'googtrans' && c.value === '/id/en'), 'cookie googtrans=/id/en');
        assert.equal(await page.locator('[data-lang-switch] [data-lang="en"]').first().getAttribute('aria-pressed'), 'true');
        await Promise.all([page.waitForNavigation(), page.locator('[data-lang-switch] [data-lang="id"]').first().click()]);
        assert.ok(!(await context.cookies()).some((c) => c.name === 'googtrans' && c.value), 'cookie dihapus saat kembali ke ID');
    } finally {
        await close();
    }
});

test('Bergabung: formulir menyusun pesan WhatsApp berbahasa Indonesia', async () => {
    const { page, problems, close } = await open('/get-involved/');
    try {
        await page.addInitScript(() => {
            window.__opened = [];
            window.open = (url) => {
                window.__opened.push(url);
                return { opener: null };
            };
        });
        await page.reload();
        const options = await page.locator('#reg-category option').allInnerTexts();
        assert.deepEqual(options, ['Donasi', 'Relawan', 'Mitra Kolaborasi']);
        await page.selectOption('#reg-category', 'partner');
        await page.fill('#reg-name', 'Yayasan Contoh');
        await page.fill('#reg-email', 'halo@contoh.org');
        await page.fill('#reg-phone', '+62 811 0000 0000');
        await page.fill('#reg-notes', 'Kami ingin berkolaborasi.');
        await page.click('form[data-whatsapp-form] button[type="submit"]');
        const opened = await page.evaluate(() => window.__opened);
        assert.equal(opened.length, 1);
        const url = new URL(opened[0]);
        assert.equal(url.host, 'wa.me');
        assert.equal(url.pathname, '/6281248133667');
        const msg = url.searchParams.get('text');
        assert.match(msg, /Kategori: Mitra Kolaborasi/);
        assert.match(msg, /Nama \/ Instansi: Yayasan Contoh/);
        assert.match(msg, /Email: halo@contoh\.org/);
        assert.match(msg, /Kami ingin berkolaborasi\./);
        assert.equal(await page.locator('[data-form-status]').isVisible(), true);

        // validasi: nama dan email wajib
        await page.reload();
        await page.click('form[data-whatsapp-form] button[type="submit"]');
        assert.equal(await page.evaluate(() => window.__opened.length), 0, 'tidak membuka WhatsApp bila form kosong');
        assert.deepEqual(problems, []);
    } finally {
        await close();
    }
});

// ---------------------------------------------------------------------------------------------
// Responsif
// ---------------------------------------------------------------------------------------------
test('Responsif: tidak ada scroll horizontal dan header tidak meluap di semua halaman', async () => {
    const paths = ['/', '/about/', '/programmes/', '/impact/', '/stories/', '/resources/', '/contact/', '/get-involved/', '/sitemap/', '/disclaimer/'];
    for (const width of [320, 390, 768, 1024, 1280, 1440]) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        try {
            for (const path of paths) {
                await page.goto(`${BASE}${path}`);
                const o = await page.evaluate(() => ({
                    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
                    ctaRight: (() => {
                        const cta = [...document.querySelectorAll('header nav a')].find((a) => a.offsetParent && /Bergabung/.test(a.textContent));
                        return cta ? cta.getBoundingClientRect().right : 0;
                    })(),
                    navWraps: (() => {
                        const nav = [...document.querySelectorAll('header nav')].find((n) => n.offsetParent);
                        return nav ? nav.scrollWidth > nav.clientWidth + 1 : false;
                    })(),
                }));
                assert.ok(o.overflow <= 0, `${path} @${width}px: scroll horizontal ${o.overflow}px`);
                assert.ok(!o.navWraps, `${path} @${width}px: menu header meluap`);
                if (o.ctaRight) assert.ok(o.ctaRight <= width, `${path} @${width}px: tombol Bergabung keluar layar`);
            }
        } finally {
            await context.close();
        }
    }
});

test('Responsif: teks banner terbaca (tidak terpotong) di layar kecil', async () => {
    for (const width of [320, 390, 768]) {
        const { page, close } = await open('/', { viewport: { width, height: 800 } });
        try {
            for (let i = 0; i < 3; i++) {
                await page.locator('[data-slide-dot]').nth(i).click();
                await settle(page, 1300);
                const r = await page.evaluate(() => {
                    const slide = document.querySelector('[data-slide][data-active="true"]');
                    const stack = slide.querySelector('.hero-slide__stack');
                    const b = stack.getBoundingClientRect();
                    const controls = document.querySelector('[data-hero-controls] > div').getBoundingClientRect();
                    const s = slide.getBoundingClientRect();
                    return { left: b.left, right: b.right, vw: document.documentElement.clientWidth, bottom: b.bottom, controlsTop: controls.top, slideHeight: s.height };
                });
                assert.ok(r.left >= 0 && r.right <= r.vw, `slide ${i + 1} @${width}: teks keluar layar`);
                assert.ok(r.bottom <= r.controlsTop + 2, `slide ${i + 1} @${width}: teks menimpa kontrol (bawah teks ${r.bottom}, atas kontrol ${r.controlsTop})`);
            }
        } finally {
            await close();
        }
    }
});

// ---------------------------------------------------------------------------------------------
// Aksesibilitas (axe-core)
// ---------------------------------------------------------------------------------------------
test('Aksesibilitas: tidak ada pelanggaran axe (WCAG A/AA) di semua halaman', async () => {
    const paths = ['/', '/about/', '/programmes/', '/impact/', '/stories/', '/resources/', '/contact/', '/get-involved/', '/sitemap/', '/disclaimer/'];
    const failures = [];
    for (const path of paths) {
        const { page, close } = await open(path, { reducedMotion: 'reduce' });
        try {
            await page.addScriptTag({ path: axePath });
            // Tampilkan semua elemen berefek agar kontras dapat diukur
            await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed')));
            const results = await page.evaluate(() =>
                axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }, resultTypes: ['violations'] }),
            );
            for (const v of results.violations) {
                if (v.impact === 'minor') continue;
                failures.push(`${path}: [${v.impact}] ${v.id} - ${v.help} (${v.nodes.length}) ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
            }
        } finally {
            await close();
        }
    }
    assert.deepEqual(failures, []);
});
