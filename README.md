# Benih Indonesia

Website statis Benih Indonesia (HTML + Tailwind CDN), tanpa build step.

## Struktur

```
index.html          Home
about.html          Organisasi, tim, visi & misi, perjalanan, mitra
programmes.html     Program (TaRL)
impact.html         Kerangka 3Cs & penerima manfaat
stories.html        Cerita Papua
resources.html      Metodologi TaRL
contact.html        Kontak & formulir pertanyaan
get-involved.html   Donasi / relawan / kemitraan
404.html            Halaman tidak ditemukan (noindex, path absolut)
assets/css/site.css Fokus keyboard, scroll offset header, reduced-motion
assets/js/          Konfigurasi Tailwind, menu mobile, navigasi bagian About, respons formulir
img/brand/          Logo terkompresi, favicon, gambar Open Graph
img/team/           Foto tim (versi -240 dipakai di halaman)
robots.txt, sitemap.xml, site.webmanifest
```

## Catatan pemeliharaan

- Header dan footer ada di setiap file HTML. Jika menambah/mengubah menu, ubah di semua halaman.
- Halaman baru: salin halaman yang ada, ganti `<title>`, `meta description`, `canonical`, tag `og:`/`twitter:`, JSON-LD, lalu tambahkan URL-nya ke `sitemap.xml`.
- Domain diasumsikan `https://benihindonesia.org`. Jika berbeda, cari-ganti di semua file `.html`, `robots.txt`, dan `sitemap.xml`.
- Formulir belum terhubung ke backend (`data-static-form` mencegah submit). Isi atribut `action` setelah endpoint tersedia.
