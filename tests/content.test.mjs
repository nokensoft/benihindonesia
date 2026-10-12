// Pengujian konten: memastikan setiap butir revisi (PDF "Revisi 01") ada di HTML hasil build.
// Jalankan setelah `npm run build`:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const pages = {
    home: 'dist/index.html',
    about: 'dist/about/index.html',
    programmes: 'dist/programmes/index.html',
    impact: 'dist/impact/index.html',
    stories: 'dist/stories/index.html',
    resources: 'dist/resources/index.html',
    contact: 'dist/contact/index.html',
    involved: 'dist/get-involved/index.html',
    notFound: 'dist/404.html',
};

const html = (name) => readFileSync(pages[name], 'utf8');

/** Teks yang terlihat (tanpa script/style/JSON-LD/SVG), spasi dirapikan. */
const text = (name) =>
    html(name)
        .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/\s+/g, ' ');

test('semua halaman hasil build ada', () => {
    for (const [name, file] of Object.entries(pages)) assert.ok(existsSync(file), `${name}: ${file} tidak ada`);
});

test('Beranda: tagline, slogan, dan cakupan wilayah sesuai revisi', () => {
    const t = text('home');
    assert.match(t, /Better Education\. Brighter Future(?!s)/);
    assert.match(t, /Teach with Compassion\. Learn with Determination/);
    assert.match(t, /Indonesia, dimulai di Kabupaten Jayapura, Papua\./);
    assert.match(t, /Organisasi nirlaba untuk literasi dan numerasi anak-anak di Indonesia\./);
    assert.match(t, /Memperkuat kemampuan literasi dan numerasi anak-anak Indonesia melalui pembelajaran kontekstual yang disesuaikan dengan tingkat kemampuan anak yang dimulai di Papua\./);
    assert.doesNotMatch(t, /Operational Regencies/);
    assert.doesNotMatch(t, /Better Literacy/);
    assert.doesNotMatch(t, /Teach the Lake/i);
    assert.doesNotMatch(t, /Brighter Futures/);
});

test('Beranda: judul "Metode Kami" dan paragraf TaRL', () => {
    const t = text('home');
    assert.match(t, /Metode Kami/);
    assert.doesNotMatch(t, /Our Teaching Methodology/);
    assert.match(t, /Benih Indonesia menggunakan metode Teaching at the Right Level \(TaRL\)\. TaRL adalah pendekatan pembelajaran yang dikembangkan oleh Pratham, sebuah organisasi pendidikan di India\./);
    assert.match(t, /untuk mencapai kompetensi yang diharapkan\./);
});

test('Beranda: banner berupa slider (3 slide), bukan gambar buatan AI', () => {
    const h = html('home');
    assert.equal((h.match(/data-slide(?=[\s>])/g) ?? []).length, 3, 'harus ada 3 slide');
    assert.match(h, /aria-roledescription="carousel"/);
    assert.equal((h.match(/<h1[\s>]/g) ?? []).length, 1, 'harus ada tepat satu h1');
    assert.doesNotMatch(h, /hero1/, 'gambar hero lama tidak boleh dipakai lagi');
    assert.ok(!existsSync('src/assets/hero1.png'));
});

test('Tema warna & judul bagian memakai bahasa Indonesia (≥90% pada navigasi/judul)', () => {
    const englishHeadings = [
        'About Us', 'Our Organization', 'Our Team', 'Our Mission', 'Our Journey', 'Our Partner', 'Featured Programmes',
        'Supporting Programmes', 'Registration Form', 'Beneficiaries in Numbers', 'Operational Regencies', 'Get Involved',
    ];
    for (const name of Object.keys(pages)) {
        const t = text(name);
        for (const heading of englishHeadings) {
            assert.ok(!t.includes(heading), `${name}: masih memuat judul Inggris "${heading}"`);
        }
    }
    const nav = html('home').match(/aria-label="Navigasi utama"[\s\S]*?<\/nav>/)[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    for (const label of ['Beranda', 'Tentang', 'Program', 'Dampak', 'Cerita', 'Bahan Ajar', 'Kontak', 'Bergabung Bersama Kami']) {
        assert.ok(nav.includes(label), `navigasi harus memuat "${label}"`);
    }
});

test('Tentang: teks organisasi, visi, misi, linimasa, dan mitra sesuai revisi', () => {
    const t = text('about');
    assert.match(t, /Tentang Kami/);
    assert.match(t, /tantangan pendidikan dasar di Indonesia yang dimulai dari Papua\./);
    assert.match(t, /anak-anak di daerah perkotaan maupun pedesaan\./);
    assert.match(t, /Visi dan Misi/);
    assert.match(t, /Menjadi lembaga yang berkontribusi dalam peningkatan literasi dan numerasi, penguatan kapasitas pengajar, serta pemberdayaan komunitas lokal demi terciptanya lingkungan belajar yang berkelanjutan\./);
    assert.match(t, /Memaksimalkan potensi setiap anak Indonesia melalui penguatan fondasi belajar\./);
    assert.match(t, /Perjalanan Kami: 2026–2030/);
    assert.match(t, /Mitra Kami/);
    assert.match(t, /D-Prize/);
    assert.doesNotMatch(t, /International University of Papua/, 'mitra yang belum final tidak ditampilkan');
});

test('Tentang: linimasa memakai efek blur reveal untuk tahun dan target capaian', () => {
    const h = html('about');
    for (const year of ['2026', '2028', '2030']) assert.match(h, new RegExp(`id="journey-${year}"`));
    assert.equal((h.match(/data-reveal="blur"/g) ?? []).length, 6, '3 tahun + 3 target');
    assert.match(h, /id="journey"/);
});

test('Program: tiga flip card SDG dengan isi dan sumber sesuai revisi', () => {
    const h = html('programmes');
    const t = text('programmes');
    assert.equal((h.match(/class="flip-card /g) ?? []).length, 3);
    assert.match(t, /Program Unggulan/);
    assert.match(t, /Program Pendukung/);
    assert.match(t, /Mengentaskan segala bentuk kemiskinan melalui peningkatan kualitas hidup anak-anak, pemuda, dan rumah tangga yang berada di bawah garis kemiskinan\./);
    assert.match(t, /Menjamin pendidikan berkualitas dan pembelajaran sepanjang hayat untuk semua dengan meningkatkan kemampuan membaca dan berhitung peserta didik\./);
    assert.match(t, /Mengurangi kesenjangan atau ketimpangan di dalam dan antarnegara tanpa memandang kelompok usia, jenis kelamin, kondisi sosial-ekonomi, dan sebagainya\./);
    assert.match(t, /Sumber: The Global Goals/);
    assert.match(h, /href="https:\/\/www\.globalgoals\.org\/"/);
    assert.match(t, /Program pendukung pelatihan guru lokal, penyediaan sudut baca masyarakat, serta workshop literasi dan numerasi berbasis aktivitas sehari-hari\./);
    assert.equal((h.match(/sdg-(01|04|10)\.[\w-]+\.webp/g) ?? []).length >= 3, true, 'gambar SDG harus dipakai di sisi depan');
});

test('Dampak: 3Cs lengkap dan kartu bergaya floating/lift-up', () => {
    const h = html('impact');
    const t = text('impact');
    assert.match(t, /Clarity \| Kejelasan/);
    assert.match(t, /Confidence \| Kepercayaan Diri/);
    assert.match(t, /Consistency \| Keberlanjutan/);
    assert.match(t, /asesmen diagnostik sederhana/);
    assert.match(t, /cerita lokal yang dekat dengan kehidupan sehari-hari mereka/);
    assert.match(t, /kunjungan sekolah secara berkala/);
    assert.match(t, /Testimoni dan Penerima Manfaat dalam Angka/);
    assert.equal((h.match(/class="lift-card /g) ?? []).length, 6, '3 kartu 3Cs + 3 kartu penerima manfaat');
});

test('Cerita: peta Indonesia hijau, delapan wilayah berwarna sesuai revisi, tertaut ke linimasa', () => {
    const h = html('stories');
    const roles = (r) => (h.match(new RegExp(`data-role="${r}"`, 'g')) ?? []).length;
    assert.equal(roles('start'), 1, 'Kabupaten Jayapura (biru)');
    assert.equal(roles('city'), 1, 'Kota Jayapura (coklat muda)');
    assert.equal(roles('next'), 6, 'enam lokasi lain (kuning)');
    assert.match(h, /fill="#3f9d63"/, 'peta Indonesia berwarna hijau');
    assert.match(h, /data-role="start"[^>]*>\s*<path[^>]*fill="#2563eb"/);
    assert.match(h, /data-role="city"[^>]*>\s*<path[^>]*fill="#d9b88f"/);
    assert.match(h, /data-role="next"[^>]*>\s*<path[^>]*fill="#facc15"/);
    assert.match(h, /<pattern id="peta-arsir"/, 'wilayah sasaran diarsir');
    assert.match(h, /<a[^>]*href="\/about\/#journey"[^>]*>\s*<svg[^>]*data-map-svg/, 'peta menaut ke linimasa');
    for (const name of ['Sentani', 'Kab. Jayapura', 'Kota Jayapura', 'Sarmi', 'Kep. Yapen', 'Biak Numfor', 'Nabire', 'Fakfak', 'Merauke']) {
        assert.ok(h.includes(`>${name}</text>`), `label peta "${name}"`);
    }
    for (const name of ['Kabupaten Jayapura', 'Kota Jayapura', 'Biak Numfor', 'Sarmi', 'Kepulauan Yapen', 'Nabire', 'Merauke', 'Fakfak']) {
        assert.ok(text('stories').includes(name), `legenda/deskripsi memuat ${name}`);
    }
    assert.match(h, /data-bbox-start="/);
    assert.match(h, /data-bbox-end="/);
});

test('Bahan Ajar, Kontak, Bergabung: judul Indonesia', () => {
    assert.match(text('resources'), /Bahan Ajar/);
    assert.match(text('resources'), /Metode Kami/);
    assert.match(text('contact'), /Kontak/);
    const t = text('involved');
    assert.match(t, /Bergabung Bersama Kami/);
    assert.match(t, /Formulir Pendaftaran/);
    for (const opt of ['Donasi', 'Relawan', 'Mitra Kolaborasi']) assert.ok(t.includes(opt), `opsi kategori "${opt}"`);
});

test('metadata: manifest dan JSON-LD memakai tagline baru', () => {
    const manifest = JSON.parse(readFileSync('public/site.webmanifest', 'utf8'));
    assert.match(manifest.description, /^Better Education\. Brighter Future/);
    const ld = html('home').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    const graph = JSON.parse(ld)['@graph'];
    const org = graph.find((n) => n['@type'] === 'NGO');
    assert.equal(org.slogan, 'Better Education. Brighter Future');
    assert.ok(org.areaServed.some((a) => a.name === 'Indonesia'));
    assert.equal(org.areaServed.filter((a) => a['@type'] === 'AdministrativeArea').length, 8);
    const titles = Object.keys(pages).map((n) => html(n).match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    for (const title of titles) assert.ok(title.length > 5);
    assert.ok(!titles.some((tt) => /Better Literacy/.test(tt)));
});

test('semua tautan internal valid (berkas dan #anchor ada)', () => {
    const fileFor = (path) => {
        if (path === '/' || path === '') return pages.home;
        const trimmed = path.replace(/^\//, '');
        const candidates = [`dist/${trimmed}index.html`, `dist/${trimmed}`, `dist/${trimmed.replace(/\/$/, '')}/index.html`];
        return candidates.find((f) => existsSync(f) && !f.endsWith('/'));
    };
    const broken = [];
    for (const name of Object.keys(pages)) {
        const h = html(name);
        for (const m of h.matchAll(/<a\s[^>]*href="([^"#]*)(#[^"]*)?"/g)) {
            const [, path, hash] = m;
            if (/^(https?:|mailto:|tel:)/.test(path)) continue;
            const target = path ? fileFor(path) : pages[name];
            if (!target) {
                broken.push(`${name}: ${path} tidak ditemukan`);
                continue;
            }
            if (hash && hash.length > 1) {
                const id = hash.slice(1);
                if (!new RegExp(`id="${id}"`).test(readFileSync(target, 'utf8'))) broken.push(`${name}: ${path}${hash} (id tidak ada)`);
            }
        }
    }
    assert.deepEqual(broken, []);
});

test('sitemap memuat semua halaman', () => {
    const sm = readFileSync('dist/sitemap-0.xml', 'utf8');
    for (const p of ['/', '/about/', '/programmes/', '/impact/', '/stories/', '/resources/', '/contact/', '/get-involved/']) {
        assert.ok(sm.includes(`https://benihindonesia.org${p}</loc>`), `sitemap memuat ${p}`);
    }
});
