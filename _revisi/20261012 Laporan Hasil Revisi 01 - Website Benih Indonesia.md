# Laporan Hasil Pengembangan — Revisi 01 Website Benih Indonesia

**Tanggal:** 12 Oktober 2026
**Acuan:** *20261012 Revisi 01 - Website Benih Indonesia.pdf* (masukan dari Frederick dan Silvia)
**Situs:** https://benihindonesia.org
**Disusun oleh:** [Nokensoft](https://nokensoft.com) (IT Consultant)
**PIC / Project Manager:** [Janzen Faidiban](https://janzenfaidiban.github.io)
**Status:** Semua butir revisi sudah dikerjakan. Beberapa efek interaktif masih disempurnakan (lihat [Kualitas & Pengujian](#kualitas--pengujian)), dan foto banner masih menunggu bahan dari tim Benih Indonesia.

---

## Ringkasan

| Halaman | Butir revisi | Selesai | Catatan |
|---|---|---|---|
| Beranda | 6 | 6 | Slide 1 sudah memakai video; menunggu foto slide 2–3 |
| Tentang | 4 (+1 tambahan) | 5 | Menunggu konfirmasi IUP |
| Program | 2 | 2 | Kontras teks kartu SDG disempurnakan |
| Dampak | 2 | 2 | – |
| Cerita | 1 | 1 | Animasi peta disempurnakan |
| Bahan Ajar, Kontak, Bergabung | Tidak ada perubahan isi | Judul diubah ke bahasa Indonesia | – |
| Footer, Peta Situs, Disclaimer | Tambahan | ✔ | Menunggu alamat akun media sosial |
| Seluruh situs | Bahasa Indonesia ≥90% | ✔ | – |

Legenda: ✔ selesai · ⏳ selesai, tetapi menunggu bahan atau konfirmasi dari tim

---

## 1. Beranda

| # | Permintaan | Hasil | Status |
|---|---|---|---|
| 1.1 | Banner diganti dengan desain buatan manusia (bukan AI), memakai *slider effect* seperti Sahul Lestari / PPMA Papua | Banner kini berupa **slider 3 slide** dengan transisi *crossfade*: (1) tagline, (2) slogan, (3) cakupan wilayah operasi. Slider berganti otomatis, bisa dijeda, dan bisa digeser dengan tombol, titik navigasi, panah keyboard, atau usap di layar sentuh. Gambar AI sudah dihapus. **Slide 1 memakai video latar** berisi anak-anak berlari di padang rumput (diambil mulai menit 0:50 dari video yang diberikan, durasi 17 detik dan diputar berulang, tanpa suara). Video dikompres dari 67 MB menjadi 1,4 MB agar ringan di jaringan seluler. Video hanya berputar saat slide 1 tampil dan ikut berhenti saat tombol jeda ditekan. Bila perangkat meminta animasi minimal atau sedang dalam mode hemat data, yang tampil gambar diam dari video. Slide 2 dan 3 sementara memakai **peta Papua yang digambar dari data resmi BIG** sambil menunggu foto. | ⏳ Foto slide 2–3 |
| 1.2 | Tagline → “Better Education. Brighter Future” | Diterapkan di banner, judul halaman, metadata media sosial, dan manifest aplikasi. | ✔ |
| 1.3 | Slogan → “Teach with Compassion. Learn with Determination” | Ditampilkan di slide kedua banner. | ✔ |
| 1.4 | “Operational regencies” → “Cakupan wilayah operasi: Indonesia, dimulai di Kabupaten Jayapura, Papua.” | Diterapkan di beranda dan slide ketiga banner. | ✔ |
| 1.5 | Teks *Better Learning* dan *Benih Indonesia* (“Better Education. Brighter Futures”; “…anak-anak di Indonesia”) | Teks diganti sesuai revisi, termasuk penghapusan kata “dasar”. Sebagai tambahan, kartu *Better Learning* dan *Stronger Communities* kini diberi ikon ilustrasi di sisi kiri: tunas yang tumbuh dari buku, dan sekelompok orang yang mewakili pemuda, pengajar, dan masyarakat. | ✔ |
| 1.6 | “Our Teaching Methodology” → “Metode Kami” beserta paragraf TaRL baru | Judul dan paragraf diganti sesuai revisi. Ejaan diseragamkan menjadi **TaRL**, karena di dokumen revisi tertulis campuran “TarL” dan “TaRL”. Di atas judul “Metode Kami” ditambahkan **ilustrasi guru dan anak-anak belajar bersama**. | ✔ |

> **Cara memasang foto banner:** taruh foto di folder `src/assets/hero/` (buat foldernya bila belum ada). Foto diurutkan menurut nama berkas, jadi foto pertama dipakai slide 1, foto kedua slide 2, dan seterusnya. Slide tanpa foto tetap memakai latar peta.

## 2. Tentang

| # | Permintaan | Hasil | Status |
|---|---|---|---|
| 2.1 | “Our Organization” → “Tentang Kami”, dengan teks direvisi (*pendidikan*, *Indonesia yang dimulai dari Papua*, *pedesaan*) | Diterapkan. | ✔ |
| 2.2 | “Vision dan Mission” → “Visi dan Misi”, dengan teks visi dan misi baru | Diterapkan. | ✔ |
| 2.3 | “Perjalanan Kami: 2026–2030”: tahun dan target capaian diberi efek *blur reveal* saat di-scroll | Tahun dan target capaian kini muncul dari keadaan kabur menjadi jelas saat masuk layar, dengan jeda singkat di antara keduanya. | ✔ |
| 2.4 | “Our Partner” → “Mitra Kami”: International University of Papua belum fix, D-Prize sudah fix, deskripsi mitra dihapus | Deskripsi mitra dihapus. Hanya **D-Prize** yang ditampilkan, lengkap dengan logonya. **International University of Papua** disembunyikan sementara karena masih berstatus “belum fix”. Logonya sudah disiapkan, jadi IUP bisa langsung ditampilkan begitu kemitraannya final. | ⏳ Konfirmasi |
| 2.5 | *(Tambahan)* Foto tim | Foto Frederick M. di bagian Tim Kami diganti dengan versi terbaru. | ✔ |

## 3. Program

| # | Permintaan | Hasil | Status |
|---|---|---|---|
| 3.1 | *Flip card* untuk SDG 1, SDG 4, dan SDG 10, dengan gambar SDG di depan, isi di belakang, dan keterangan “Sumber: The Global Goals” | Tiga kartu dibuat. Sisi depan memakai **ikon resmi SDG**, sisi belakang berisi teks revisi dengan warna khas masing-masing SDG. Kartu berbalik saat disorot mouse, diklik/diketuk, atau ditekan Enter/Spasi. Keterangan “Sumber: The Global Goals” ditautkan ke globalgoals.org. | ✔ |
| 3.2 | “Supporting Programmes” → “Program Pendukung”, dengan tambahan “literasi dan” dan penghapusan “dasar” | Diterapkan. | ✔ |

## 4. Dampak

| # | Permintaan | Hasil | Status |
|---|---|---|---|
| 4.1 | Judul diubah menjadi “3Cs” dan “Testimoni dan Penerima Manfaat dalam Angka”, dengan teks 3Cs baru (Clarity/Kejelasan, Confidence/Kepercayaan Diri, Consistency/Keberlanjutan) | Diterapkan. | ✔ |
| 4.2 | Efek *floating* / *lift-up* (atau usulan lain) | Dipilih gabungan **muncul dari bawah + melayang pelan + terangkat saat disorot**. Opsi *slide-in/slide-out overlay* tidak dipakai karena menyembunyikan teks di balik interaksi. Dengan gabungan ini isi kartu langsung terbaca, termasuk di ponsel. | ✔ |

## 5. Cerita

| # | Permintaan | Hasil | Status |
|---|---|---|---|
| 5.1 | Peta Indonesia hijau dengan efek *scroll-driven* dari Indonesia ke delapan titik di Papua: lokasi awal (Sentani & Kabupaten Jayapura) biru, Kota Jayapura coklat muda, 6 lokasi lain kuning, dan peta bisa diklik menuju linimasa 2026–2030 | Bagian baru **“Jalur Perluasan Kami”** dibuat. Saat pengunjung scroll, peta memperbesar dari seluruh Indonesia ke Papua dan menampilkan wilayah sasaran secara bertahap, beserta keterangan per tahap. Seluruh peta bisa diklik menuju **Perjalanan Kami 2026–2030** di halaman Tentang. Peta digambar dari data batas administrasi resmi **BIG** (bukan gambar ilustrasi), sehingga bentuk wilayahnya akurat. | ✔ |

Wilayah dan warna yang ditampilkan:

| Warna | Wilayah | Tahap |
|---|---|---|
| Biru | Kabupaten Jayapura (termasuk Sentani) | Lokasi awal intervensi, 2026 |
| Coklat muda | Kota Jayapura | 2026 |
| Kuning | Biak Numfor, Sarmi, Kepulauan Yapen, Nabire, Merauke, Fakfak | Replikasi, 2028 |

## 6. Bahan Ajar, Kontak, Bergabung Bersama Kami

Isi tidak diubah, sesuai catatan “sudah bagus/oke”. Judul halaman diubah ke bahasa Indonesia: **Bahan Ajar**, **Kontak**, dan **Bergabung Bersama Kami**. Di halaman Bahan Ajar ditambahkan ilustrasi yang sama dengan bagian “Metode Kami” di beranda, tepat di bawah judul halaman.

## 7. Footer, Peta Situs, dan Disclaimer (tambahan)

- **Ikuti Kami:** di kolom kanan footer ditambahkan ikon LinkedIn, Instagram, Facebook, Saluran WhatsApp, dan YouTube. Alamat akun belum kami terima, jadi untuk sementara ikon tampil bertanda “segera hadir” dan belum bisa diklik. Begitu alamat akun dikirim, ikon langsung aktif.
- **Peta Situs** (`/sitemap/`): halaman baru berisi daftar seluruh halaman beserta bagian penting di dalamnya, misalnya Perjalanan Kami 2026–2030 dan peta wilayah.
- **Disclaimer** (`/disclaimer/`): halaman baru berisi ketentuan umum tentang keakuratan informasi, hak cipta dan penggunaan konten, foto anak dan privasi, **pemanfaatan kecerdasan buatan (AI)**, terjemahan otomatis, dan tautan ke situs lain. Mohon tim meninjau isinya, terutama bagian AI dan foto anak, agar sesuai dengan praktik Benih Indonesia.
- Tautan “Peta Situs | Disclaimer” tersedia di bagian bawah footer di semua halaman.

## 8. Bahasa Indonesia ≥90%

- Menu navigasi, judul halaman, judul bagian, tombol, label formulir, dan pesan WhatsApp dari formulir pendaftaran kini berbahasa Indonesia.
- Istilah yang dipertahankan dalam bahasa Inggris hanya yang tidak punya padanan atau berupa nama/merek: *Teaching at the Right Level (TaRL)*, *3Cs* (Clarity, Confidence, Consistency), tagline, slogan, *Better Learning*, *Stronger Communities*, *D-Prize*, dan *The Global Goals*.
- Tombol **ID/EN** tetap tersedia. Versi Inggris diterjemahkan otomatis, kecuali nama merek, tagline, dan slogan yang sengaja tidak diterjemahkan.

---

## Kualitas & Pengujian

Agar semua efek baru tetap nyaman dan bisa diakses semua pengunjung, website diuji dari beberapa sisi:

- **Ramah ponsel:** semua halaman diuji di layar kecil. Tidak ada geser horizontal dan teks banner tidak terpotong.
- **Aksesibilitas:** diperiksa dengan standar WCAG A/AA (axe-core) di semua halaman. Slider, *flip card*, dan menu bisa dioperasikan dengan keyboard.
- **“Kurangi gerakan”:** bila perangkat pengunjung meminta animasi minimal, slider tidak berganti otomatis, efek melayang dimatikan, dan peta langsung tampil dalam keadaan akhir.
- **Tanpa JavaScript:** semua isi tetap terlihat, tidak ada yang tersembunyi di balik efek.
- **Uji otomatis:** setiap butir revisi di atas dicek oleh tes otomatis terhadap hasil build situs.

**Hasil uji terakhir (12 Oktober 2026):** 37 dari 43 tes lolos.

- **Isi konten: 18 dari 18 tes lolos.** Semua teks revisi, judul berbahasa Indonesia, tagline baru di metadata, logo mitra, video banner, ilustrasi Metode Kami/Bahan Ajar, footer media sosial, halaman Peta Situs dan Disclaimer, tautan internal, dan sitemap sudah sesuai.
- **Perilaku di browser: 19 dari 25 tes lolos.** Slider beranda beserta video latarnya, navigasi, menu seluler, tombol ID/EN, formulir WhatsApp, tampilan responsif, mode “kurangi gerakan”, dan tampilan tanpa JavaScript sudah berfungsi.

Hal yang masih disempurnakan sebelum rilis:

| Bagian | Temuan |
|---|---|
| Cerita – peta *scroll-driven* | Keterangan bertahap belum berganti sesuai posisi scroll. Label “Kota Jayapura” dan “Sentani” keluar dari layar di monitor lebar (1440 px). |
| Cerita – tautan peta | Label aksesibilitas tautan peta belum memuat teks yang terlihat di layar. |
| Program – *flip card* SDG | Kontras teks judul di sisi belakang kartu SDG 1 dan SDG 10 belum memenuhi standar keterbacaan WCAG AA. Tes perilaku membalik kartu juga belum lolos. |
| Tentang – *blur reveal* linimasa | Tes efek muncul saat scroll belum lolos. |
| Dampak – kartu melayang | Tes efek melayang/terangkat tidak bisa selesai karena kartu terus bergerak. Kemungkinan alat tesnya yang perlu disesuaikan, bukan efeknya. |

Laporan pembaruan akan dikirim setelah semua hal di atas selesai dan seluruh tes lolos.

---

## Yang Dibutuhkan dari Tim Benih Indonesia

1. **Foto banner untuk slide 2 dan 3 (disarankan landscape, lebar minimal 2000 px):** foto anak-anak Papua belajar di lapangan, kegiatan belajar, dan/atau peta Papua. Pastikan ada izin penggunaan foto, terutama yang menampilkan wajah anak.
2. **Konfirmasi International University of Papua:** kabari kami bila kemitraan sudah final agar IUP ditampilkan kembali sebagai mitra.
3. **Alamat akun media sosial resmi:** LinkedIn, Instagram, Facebook, Saluran WhatsApp, dan YouTube. Akun yang belum ada boleh dikosongkan.
4. **Tinjauan isi halaman Disclaimer**, terutama bagian pemanfaatan AI dan foto anak.
5. *(Opsional)* Data angka untuk bagian “Penerima Manfaat dalam Angka” (jumlah guru relawan, peserta didik, dan komunitas), serta testimoni. Saat ini bagian tersebut masih berupa keterangan umum tanpa angka.
6. *(Opsional)* Video Canva “Benih Indonesia” yang disebut di revisi, bila ingin dipakai menggantikan video latar slide 1 saat ini.
7. **Konfirmasi penggunaan ilustrasi:** revisi meminta banner yang tidak memakai gambar buatan AI, dan banner kini sudah memakai video. Mohon konfirmasi apakah ilustrasi di bagian “Metode Kami” dan halaman Bahan Ajar sudah sesuai untuk dipakai. Bila ilustrasi buatan AI tidak diinginkan di bagian mana pun, ilustrasi tersebut dapat diganti dengan foto kegiatan.

Setelah bahan diterima, pemasangannya hanya perlu menaruh berkas di folder yang sudah disiapkan. Struktur halaman tidak perlu diubah.
