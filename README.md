# Benih Indonesia

Website Benih Indonesia, dibangun dengan [Astro](https://astro.build) dan Tailwind CSS v4. Hasil build berupa HTML statis dengan URL bersih (`/about/`).

## Menjalankan

Butuh Node.js LTS.

```sh
npm install        # sekali, setelah clone
npm run dev        # pratinjau di http://localhost:4321 (auto-refresh)
npm run build      # hasil siap upload di dist/
npm run preview    # cek hasil build secara lokal
```

## Struktur

```
src/
  pages/              Satu file = satu URL (index → /, about → /about/, ...)
  layouts/BaseLayout  <head>: title, meta description, canonical, Open Graph, JSON-LD
  components/         Header, Footer, Breadcrumb, LangSwitch
  data/site.ts        Menu navigasi, alamat, koordinat peta, nomor WhatsApp
  assets/             Gambar sumber (dioptimasi otomatis ke AVIF/WebP saat build)
  scripts/main.js     Menu mobile, navigasi bagian About, ID/EN, formulir WhatsApp
  styles/global.css   Tema Tailwind (warna brand) dan gaya global
public/               Disalin apa adanya: favicon, og-image, robots.txt, manifest
deploy/nginx.conf     Potongan konfigurasi Nginx untuk CloudPanel
.github/workflows/    Build otomatis + upload ke VPS saat push ke main
```

## Catatan pemeliharaan

- Menu, alamat, dan nomor WhatsApp diubah di `src/data/site.ts`; semua halaman ikut berubah.
- Halaman baru: buat `src/pages/<nama>.astro` memakai `BaseLayout` (isi `title`, `description`, `breadcrumb`), lalu tambahkan ke `nav` di `site.ts` jika perlu. Sitemap dibuat otomatis.
- Gambar: simpan di `src/assets/` dan tampilkan dengan `<Image>` / `<Picture>` dari `astro:assets`.
- Terjemahan ID/EN memakai Google Translate (cookie `googtrans`; script Google hanya dimuat saat EN dipilih). Teks yang tidak boleh diterjemahkan beri `translate="no" class="notranslate"`. Navigasi sengaja berbahasa Inggris dan tidak diterjemahkan.
- Formulir Get Involved dikirim sebagai pesan WhatsApp ke `site.whatsapp`.
- Peta di Contact memakai iframe Google Maps dari koordinat `site.geo`. Untuk lokasi lain: Google Maps → Share → Embed a map.

## Deploy (VPS CloudPanel)

1. CloudPanel: buat **Static HTML Site** untuk `benihindonesia.org`, pasang SSL Let's Encrypt.
2. Tempel isi `deploy/nginx.conf` di **Vhost** site tersebut.
3. Tambahkan SSH key deploy ke site user, lalu isi secrets `SSH_HOST`, `SSH_USER`, `SSH_KEY` di GitHub.
4. Push ke `main` → GitHub Actions membangun situs dan mengunggah `dist/` ke VPS.

Deploy manual: `npm run build`, lalu upload isi `dist/` ke `/home/<site-user>/htdocs/benihindonesia.org/`.
