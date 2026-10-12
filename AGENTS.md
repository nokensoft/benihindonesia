# AGENTS.md

Panduan untuk agen AI (dan pengembang) yang bekerja di repo ini. Baca bersama [README.md](README.md) (cara menjalankan & deploy).

## Ringkasan

Situs profil organisasi nirlaba **Benih Indonesia** (literasi & numerasi anak, mulai di Kabupaten Jayapura, Papua) di `https://benihindonesia.org`.

- **Astro 7** — output HTML statis, `trailingSlash: 'always'`, `build.format: 'directory'` (`/about/` → `dist/about/index.html`).
- **Tailwind CSS v4** lewat `@tailwindcss/vite` (tanpa `tailwind.config`; tema ada di `@theme` pada `src/styles/global.css`).
- `@astrojs/sitemap` (halaman `/404` dikecualikan).
- Tidak ada framework UI (React/Vue), tidak ada backend, tidak ada CMS. Semua konten ditulis langsung di file `.astro`/`.ts`.
- Bahasa konten utama: **Indonesia**. Versi Inggris dihasilkan Google Translate di sisi klien.

## Pihak terkait

| Peran | Nama | Kontak |
|---|---|---|
| Klien | Benih Indonesia — Frederick M. & Silvia Wambukomo (Co-founder) | info@benihindonesia.org |
| IT Consultant | **Nokensoft** | https://nokensoft.com |
| PIC / Project Manager | **Janzen Faidiban** (Nokensoft) | https://janzenfaidiban.github.io |

Laporan dan dokumen untuk klien ditulis atas nama Nokensoft sebagai IT Consultant, dengan Janzen Faidiban sebagai PIC.

## Perintah

```sh
npm install          # sekali setelah clone
npm run dev          # http://localhost:4321
npm run build        # hasil di dist/
npm run preview      # sajikan dist/
npm test             # node --test tests/*.test.mjs (BUTUH dist/ — jalankan build dulu)
npm run test:all     # build + test
npm run build:map    # regenerasi src/data/map.ts dari GeoJSON (butuh internet; jarang dipakai)
node tests/screenshots.mjs   # tangkapan layar ke test-results/screenshots/
```

Pengujian browser memakai `playwright-core` dengan **Chrome/Edge yang sudah terpasang** (channel `chrome` lalu `msedge`); tidak ada unduhan browser. Server uji: `astro preview` di port **4399**.

## Struktur

```
src/
  pages/            Satu file = satu URL: index, about, programmes, impact, stories,
                    resources, contact, get-involved, sitemap (peta situs HTML),
                    disclaimer, 404
  layouts/BaseLayout.astro   <head> (SEO, OG, JSON-LD @graph), Header/Footer, dan
                             SATU-SATUNYA <script> bundel yang memanggil semua init*
  components/
    Header, Footer, Breadcrumb, LangSwitch
    HeroSlider.astro   Banner beranda (slider crossfade, 3 slide)
    ScrollMap.astro    Peta Indonesia → 8 wilayah Papua, digerakkan scroll (halaman Cerita)
  data/
    site.ts          Sumber tunggal: nama, tagline, slogan, kontak, WhatsApp, alamat, geo, nav, cta,
                     social (URL media sosial; kosong = ikon "segera hadir"), legal (tautan footer bawah)
    map.ts           DIHASILKAN OTOMATIS oleh scripts/build-map.mjs — jangan diedit manual
  scripts/
    main.js          Menu seluler, section nav, ID/EN (cookie googtrans), formulir WhatsApp
    effects.js       initReveal ([data-reveal]), initFlipCards (kartu SDG)
    hero-slider.js   initHeroSlider
    scroll-map.js    initScrollMap
  styles/global.css  Tema brand + semua CSS efek (reveal, lift-card, flip-card, hero, scroll-map)
  assets/            Gambar sumber (dioptimasi astro:assets): logo, team/, sdg/, hero/, partners/, illustrations/
public/              Disalin apa adanya: img/brand (favicon, og-image), video/ (video latar banner
                     + poster; kompres dulu, mis. 720p/24fps/H.264 CRF ~32 tanpa audio), robots.txt, site.webmanifest
scripts/build-map.mjs  Generator map.ts (sumber: mashadinoor/Indonesia-Geojson-2026, data BIG, MIT)
tests/
  content.test.mjs   Cek HTML di dist/ terhadap butir revisi klien
  browser.test.mjs   Perilaku di browser + axe-core (WCAG A/AA) + responsif + tanpa-JS
  helpers.mjs        startServer() / launchBrowser()
  screenshots.mjs    Skrip tangkapan layar (bukan test)
deploy/              deploy.sh (VPS: git pull → npm ci → build → rsync dist/), nginx.conf
.github/workflows/deploy.yml  Deploy opsional via SSH (butuh secrets SSH_HOST/USER/KEY)
_revisi/             PDF revisi dari klien (acuan isi; jangan diubah) + laporan hasil revisi (.md)
```

## Konvensi kode

- **Indentasi 4 spasi**, kutip tunggal di JS/TS.
- **Komentar dalam Bahasa Indonesia**, singkat, menjelaskan *mengapa*. Ikuti gaya yang ada.
- Script klien (`src/scripts/*.js`) ditulis gaya ES5-ish (`var`, `function`) dan diekspor sebagai `initX()` yang **aman dipanggil di semua halaman** (langsung `return` bila elemen tidak ada). Init baru didaftarkan di `<script>` pada `BaseLayout.astro`.
- Perilaku JS dikaitkan lewat **atribut `data-*`** (mis. `data-reveal`, `data-hero-slider`, `data-scroll-map`, `data-whatsapp-form`), bukan class. State visual via `data-active`, `aria-pressed`, `aria-expanded`, `.is-revealed`. Jangan ganti nama hook tanpa memperbarui JS, CSS, dan tests.
- Styling memakai utilitas Tailwind; warna brand: `brand-50/100/600/700/800/900` (hijau). CSS kustom hanya untuk efek/animasi di `global.css`.
- Gambar: simpan di `src/assets/`, tampilkan dengan `<Image>` / `<Picture>` dari `astro:assets`. Folder `hero/` dan `partners/` dibaca dengan `import.meta.glob` — cukup taruh berkas (hero: urut nama → slide ke-N; partner: `<id>.png|jpg|webp|svg`).
- Halaman baru: `src/pages/<nama>.astro` dengan `BaseLayout` (`title`, `description`, `breadcrumb`, opsional `pageType`, `schema`), tambahkan ke `nav` di `site.ts` bila perlu, lalu tambahkan ke daftar `pages` di `tests/content.test.mjs`.
- Data kontak/teks global **jangan di-hardcode**; ambil dari `src/data/site.ts`.

## Aturan penting (mudah terlewat)

1. **Progressive enhancement wajib.** `BaseLayout` menambah class `js` ke `<html>` sebelum render; CSS efek hanya menyembunyikan konten di bawah `.js`. Tanpa JS semua konten harus tetap terlihat (slide pertama tampil, peta di keadaan akhir). Ada test untuk ini.
2. **`prefers-reduced-motion`** harus dihormati: matikan autoplay slider, reveal, floating, dan animasi peta (peta statis di keadaan akhir).
3. **Aksesibilitas**: test axe-core harus bersih di semua halaman. Pertahankan `aria-*`, label tombol berbahasa Indonesia, fokus terlihat, kontrol keyboard (slider: panah kiri/kanan; flip card: Enter/Spasi).
4. **Terjemahan**: teks yang tidak boleh diterjemahkan (nama merek, tagline/slogan Inggris, nomor, tombol ID/EN) diberi `translate="no" class="notranslate"`. Script Google Translate hanya dimuat saat EN dipilih. Label navigasi kini berbahasa **Indonesia** (README bagian ini sudah usang).
5. **Formulir Get Involved** tidak punya backend: menyusun pesan WhatsApp (berbahasa Indonesia) ke `site.whatsapp`.
6. **`src/data/map.ts` jangan diedit tangan** — ubah `scripts/build-map.mjs` (mis. `TARGETS`, peran `start`/`city`/`next`) lalu `npm run build:map`. Warna peran ada di `ScrollMap.astro` (`start` biru, `city` coklat muda, `next` kuning) dan diuji.
7. **Isi konten mengikuti revisi klien** (`_revisi/*.pdf`). `tests/content.test.mjs` memeriksa teks tertentu (tagline, slogan, TaRL, 3Cs, SDG, linimasa 2026–2030, judul Indonesia ≥90%). Jika mengubah copy, pastikan test masih lolos atau perbarui test dengan sengaja.
8. Tidak boleh memakai gambar buatan AI untuk banner (ada test); bila `src/assets/hero/` kosong, latar slide memakai peta Papua dari data BIG.
9. Jangan commit `dist/`, `.astro/`, `node_modules/`, `test-results/`.

## Laporan hasil revisi (wajib selalu diperbarui)

Setiap dokumen revisi klien di `_revisi/` punya laporan pasangan dengan nomor versi yang sama:

```
_revisi/<YYYYMMDD> Revisi <NN> - Website Benih Indonesia.pdf                ← dari klien (jangan diubah)
_revisi/<YYYYMMDD> Laporan Hasil Revisi <NN> - Website Benih Indonesia.md   ← dibuat/diperbarui agen
```

Contoh: `20261012 Revisi 01 - …pdf` ↔ `20261012 Laporan Hasil Revisi 01 - …md`.

Aturan:

1. **Setiap perubahan yang menyentuh butir revisi** (konten, efek, mitra, gambar, perbaikan tes) harus diikuti pembaruan laporan versi revisi yang sedang berjalan, dalam sesi yang sama. Ubah status butir (✔ selesai / ⏳ menunggu bahan atau konfirmasi), tabel ringkasan, dan daftar "Yang Dibutuhkan dari Tim".
2. **Bagian hasil uji** harus memuat angka nyata dari `npm run test:all` terakhir (jumlah lolos/gagal, dipisah antara tes konten dan tes browser) beserta tanggalnya, serta daftar temuan yang belum beres. Jangan menulis "semua lolos" tanpa menjalankan tes.
3. **Revisi baru dari klien** (mis. `Revisi 02`): buat laporan baru dengan nomor dan tanggal yang sesuai. Laporan versi sebelumnya dibiarkan sebagai arsip. Butir yang belum selesai dari versi lama dibawa ke laporan baru.
4. Pembaca laporan adalah **klien** (non-teknis). Gunakan bahasa Indonesia yang jelas dan minim istilah teknis. Nama file/folder hanya disebut bila klien perlu menaruh bahan. Header laporan mencantumkan Nokensoft (IT Consultant) dan Janzen Faidiban (PIC/Project Manager).
5. Hal yang disembunyikan atau ditunda sementara (mis. mitra yang belum final) harus dicatat di laporan beserta alasannya.

## Verifikasi sebelum selesai

```sh
npm run test:all
```

Semua test harus lolos (butuh Chrome atau Edge terpasang untuk `browser.test.mjs`). Setelah itu perbarui bagian hasil uji di laporan hasil revisi yang sedang berjalan (lihat bagian di atas). Untuk perubahan visual, jalankan juga `node tests/screenshots.mjs` dan tinjau `test-results/screenshots/`.

## Deploy

Push ke `main` → di VPS jalankan `bash ~/benihindonesia/deploy/deploy.sh` (detail di README). Workflow GitHub Actions bersifat opsional dan akan gagal tanpa secrets. Jangan push/deploy tanpa diminta.
