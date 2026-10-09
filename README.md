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
deploy/deploy.sh      Skrip deploy di VPS: git pull → build → salin dist/ ke folder web
deploy/nginx.conf     Potongan konfigurasi Nginx untuk CloudPanel
.github/workflows/    (Opsional) deploy otomatis via GitHub Actions
```

## Catatan pemeliharaan

- Menu, alamat, dan nomor WhatsApp diubah di `src/data/site.ts`; semua halaman ikut berubah.
- Halaman baru: buat `src/pages/<nama>.astro` memakai `BaseLayout` (isi `title`, `description`, `breadcrumb`), lalu tambahkan ke `nav` di `site.ts` jika perlu. Sitemap dibuat otomatis.
- Gambar: simpan di `src/assets/` dan tampilkan dengan `<Image>` / `<Picture>` dari `astro:assets`.
- Terjemahan ID/EN memakai Google Translate (cookie `googtrans`; script Google hanya dimuat saat EN dipilih). Teks yang tidak boleh diterjemahkan beri `translate="no" class="notranslate"`. Navigasi sengaja berbahasa Inggris dan tidak diterjemahkan.
- Formulir Get Involved dikirim sebagai pesan WhatsApp ke `site.whatsapp`.
- Peta di Contact memakai iframe Google Maps dari koordinat `site.geo`. Untuk lokasi lain: Google Maps → Share → Embed a map.

## Deploy (VPS CloudPanel, via `git pull`)

Repo disimpan di luar folder web (`~/benihindonesia`), di-build di VPS, lalu hanya isi `dist/` yang disalin ke folder web CloudPanel (`~/htdocs/benihindonesia.org`). File sumber tidak ikut terekspos dan situs tidak kosong selama build.

Ganti `<site-user>` dan `<ip-vps>` sesuai server.

### 1. CloudPanel (sekali)

1. Pastikan DNS (record A) `benihindonesia.org` mengarah ke IP VPS.
2. **Sites → Add Site → Create a Static HTML Site**, domain `benihindonesia.org`, buat site user.
3. **SSL/TLS → New Let's Encrypt Certificate.**
4. **Vhost**: tempel isi `deploy/nginx.conf` sesuai petunjuk di dalam file tersebut, lalu simpan.

### 2. Persiapan VPS (sekali)

Login sebagai site user (bukan root, agar kepemilikan file benar):

```bash
ssh <site-user>@<ip-vps>        # atau dari root: su - <site-user>
```

Pasang Node.js lewat nvm (tanpa root; cek versi terbaru nvm di github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v
```

Clone repo. Jika repo publik:

```bash
git clone https://github.com/nokensoft/benihindonesia.git ~/benihindonesia
```

Jika repo privat, gunakan deploy key (read-only):

```bash
ssh-keygen -t ed25519 -C "benihindonesia-vps" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub
# Tambahkan ke GitHub → repo → Settings → Deploy keys (tanpa write access)

cat >> ~/.ssh/config <<'EOF'
Host github.com
    IdentityFile ~/.ssh/github_deploy
    IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
git clone git@github.com:nokensoft/benihindonesia.git ~/benihindonesia
```

Jika memakai branch selain `main`: `cd ~/benihindonesia && git checkout <branch>`.

### 3. Deploy

Deploy pertama dan setiap update berikutnya (setelah push dari komputer):

```bash
bash ~/benihindonesia/deploy/deploy.sh
```

Skrip menjalankan `git pull` → `npm ci` → `npm run build`, lalu menyalin `dist/` ke `~/htdocs/benihindonesia.org/` (folder `.well-known` untuk SSL tidak dihapus). Folder tujuan bisa diganti: `WEB_ROOT=/path/lain bash deploy/deploy.sh`.

### 4. Cek setelah deploy

```bash
curl -I https://benihindonesia.org/about/        # 200
curl -I https://benihindonesia.org/about.html    # 301 → /about/
curl -I https://benihindonesia.org/about         # 301 → /about/
```

Daftarkan `https://benihindonesia.org/sitemap-index.xml` di Google Search Console.

### Kendala umum

| Gejala | Solusi |
|---|---|
| `rsync: command not found` | Minta root menjalankan `apt install rsync` |
| Error `sharp` saat build | `cd ~/benihindonesia && npm rebuild sharp` |
| Build berhenti / `Killed` | RAM kurang; tambahkan swap 1–2 GB (perlu root) |
| `npm: command not found` di skrip | Pastikan nvm terpasang untuk site user yang sama |

### Alternatif

- **Deploy manual tanpa build di VPS:** jalankan `npm run build` di komputer, lalu upload isi `dist/` ke `/home/<site-user>/htdocs/benihindonesia.org/` via SFTP.
- **GitHub Actions** (`.github/workflows/deploy.yml`): build dan upload otomatis setiap push ke `main`. Butuh secrets `SSH_HOST`, `SSH_USER`, `SSH_KEY` di GitHub; tanpa secrets tersebut workflow akan gagal. Hapus file ini jika hanya memakai cara `git pull`.
