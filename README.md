# MusSync

MusSync adalah aplikasi katalog musik untuk menemukan, menilai, dan mereview album. Data album dan artis berasal dari [Last.fm](https://www.last.fm), sedangkan pustaka, rating, ulasan, favorit, profil, dan tema disimpan langsung di browser pengguna.

MusSync tidak menyediakan pemutar musik. Fokusnya adalah menjadi papan skor personal untuk menemukan album yang layak didengarkan.

## Fitur

- Beranda dengan album pilihan, arsip, rekomendasi, pencarian album, dan pencarian artis.
- Detail album lengkap dengan cover art, tag, daftar lagu, statistik, album lain, dan album serupa.
- Rating bintang, ulasan, wishlist "mau dengar", favorit album, dan tautan yang dapat disalin.
- Katalog genre dan halaman artis.
- Pustaka pribadi dengan tab album dinilai, mau dengar, favorit, dan statistik.
- Ekspor dan impor pustaka dalam format JSON.
- Dashboard riwayat dengar Last.fm berdasarkan username.
- Profil lokal sederhana dengan nama, avatar, statistik, artis favorit, dan album favorit.
- Tema terang/gelap, layout responsif, dan bottom navigation pada layar mobile.

## Teknologi

| Teknologi | Versi | Kegunaan |
| --- | --- | --- |
| React | 19.2 | Antarmuka dan komponen aplikasi |
| TypeScript | 6.0 | Type safety |
| Vite | 8.2 | Development server, build, dan preview |
| React Router | 7.18 | Routing halaman |
| Oxlint | 1.79 | Linting |
| CSS | Native | Styling responsif dan design token |

Proyek ini tidak menggunakan backend, database, framework CSS, atau library state management tambahan.

## Prasyarat

Pastikan sudah terpasang:

- Node.js `^20.19.0` atau `>=22.12.0`
- npm
- API key Last.fm untuk fitur katalog dan riwayat listening

## Menjalankan Proyek

### 1. Clone repository

```bash
git clone <url-repository>
cd MusSync
```

Ganti `<url-repository>` dengan URL repository yang digunakan project ini.

### 2. Install dependensi

```bash
npm install
```

### 3. Siapkan environment

Salin contoh environment lalu isi API key Last.fm:

```bash
cp .env.example .env.local
```

Isi nilainya:

```env
VITE_LASTFM_API_KEY=api_key_anda
```

API key dapat dibuat di [Last.fm API account](https://www.last.fm/api/account/create). File `.env.local` sudah diabaikan oleh Git dan tidak boleh ikut di-commit.

> `VITE_LASTFM_API_KEY` akan digunakan di sisi browser dan masuk ke bundle production. Jangan menggunakan nilai-rahasia atau kredensial lain pada variabel ini.

### 4. Jalankan development server

```bash
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Perintah yang Tersedia

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan development server dengan HMR |
| `npm run build` | Menjalankan typecheck project dan membuat build production ke `dist/` |
| `npm run preview` | Menjalankan preview hasil build |
| `npm run lint` | Menjalankan Oxlint |
| `npx tsc -p tsconfig.app.json --noEmit` | Menjalankan typecheck aplikasi saja |

Repositori belum memiliki automated test suite.

## Integrasi Last.fm

Aplikasi tidak melakukan autentikasi OAuth. Untuk halaman `/listening`, pengguna memasukkan username Last.fm secara manual.

Frontend mengirim request ke path:

```text
/lastfm/?method=...&api_key=...
```

Selama development, Vite mem-proxy path tersebut ke:

```text
https://ws.audioscrobbler.com/2.0/
```

Respons Last.fm dinormalisasi oleh `src/services/lastfm.ts` dan disimpan sementara di browser:

- Cache umum: 6 jam.
- Detail album, artis, dan profil: 24 jam.
- Scrobble terbaru: 10 menit.

### Konfigurasi production

Untuk deployment static, hosting perlu menyediakan dua konfigurasi:

1. Fallback semua route ke `index.html` karena aplikasi menggunakan `BrowserRouter`.
2. Proxy atau rewrite request `/lastfm/*` ke `https://ws.audioscrobbler.com/2.0/*` sambil mempertahankan query string.

Hosting static biasa belum tentu menyediakan proxy Last.fm. Jika proxy tidak tersedia, request katalog dan riwayat listening harus diarahkan melalui backend atau serverless function.

## Halaman

| Route | Halaman |
| --- | --- |
| `/` | Beranda dan rekomendasi |
| `/music/:id` | Detail album |
| `/genre` | Daftar genre |
| `/genre/:name` | Album untuk sebuah genre |
| `/artist/:name` | Detail artis dan albumnya |
| `/library` | Pustaka dan statistik lokal |
| `/listening` | Riwayat dengar dari Last.fm |
| `/profile` | Profil lokal |

Route yang tidak dikenal diarahkan kembali ke beranda.

## Penyimpanan dan Privasi

Tidak ada akun, sinkronisasi cloud, analitik, atau database server. Data lokal disimpan di `localStorage` dengan key berikut:

| Key | Isi |
| --- | --- |
| `mussync.library.v1` | Album dinilai dan mau dengar |
| `mussync.favorites.v1` | Album favorit |
| `mussync.reviews.v2` | Ulasan lokal |
| `mussync.artist-favs.v1` | Artis favorit |
| `mussync.profile.v1` | Nama, avatar, dan waktu profil dibuat |
| `mussync.recent.v1` | Album yang baru dibuka |
| `mussync.theme.v1` | Tema gelap atau terang |
| `mussync.lfm-user.v1` | Username Last.fm yang ditautkan |
| `mussync.lf.v1.*` | Cache response Last.fm |

Konsekuensinya:

- Data hanya tersedia pada browser dan origin yang sama.
- Menghapus data situs akan menghapus pustaka, ulasan, profil, dan favorit.
- Berpindah browser atau perangkat tidak otomatis memindahkan data.
- Username Last.fm bukan akun yang login ke MusSync.
- Review MusSync tidak dikirim atau disinkronkan ke Last.fm.
- Export JSON hanya mencakup pustaka dan album favorit, bukan ulasan, profil, favorit artis, tema, atau username Last.fm.
- Last.fm mungkin tidak mengembalikan riwayat pengguna privat.

Aplikasi juga dapat meminta cover art dari CDN Last.fm dan memuat font Inter serta JetBrains Mono dari Google Fonts.

## Struktur Project

```text
MusSync/
├── public/                 # Aset statis
├── src/
│   ├── app/                # Komposisi aplikasi dan route
│   ├── components/         # Komponen UI per fitur
│   ├── contexts/           # State library, ulasan, profil, dan favorit
│   ├── data/               # Data lokal, seperti daftar genre
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Halaman aplikasi
│   ├── services/           # Integrasi API Last.fm
│   ├── styles/             # Token dan layout global
│   ├── types/              # Type data bersama
│   ├── utils/              # Storage, skor, tanggal, dan helper
│   └── main.tsx
├── .env.example
├── vite.config.ts
└── package.json
```

### Alur data

```text
Halaman React
  ├── Context/hook lokal ──> localStorage
  └── Service Last.fm ────> request /lastfm ──> cache lokal + response
```

`src/app/App.tsx`/provider menjadi titik masuk routing dan state global. Setiap halaman bekerja dengan service, context, atau hook sesuai kebutuhan fitur.

## Menyakakan Aplikasi

Sebelum melakukan deployment:

1. Jalankan `npm run lint`.
2. Jalankan `npm run build`.
3. Pastikan `dist/` dapat disajikan sebagai static site.
4. Atur fallback SPA.
5. Atur proxy `/lastfm/*` atau ganti service API dengan backend.
6. Uji `/`, `/library`, `/profile`, dan `/listening` pada browser serta perangkat mobile.

## Batasan Saat Ini

- Tidak ada backend, autentikasi, atau sinkronisasi antarperangkat.
- Integrasi Last.fm bergantung pada API key, rate limit, dan ketersediaan data Last.fm.
- Cover art dan data katalog membutuhkan koneksi internet.
- Belum ada automated test suite.
- Lisensi belum ditetapkan. Tambahkan file `LICENSE` sebelum mendistribusikan project sebagai open source.

## Kontribusi

Sebelum mengirim perubahan:

1. Jangan commit `.env.local` atau data pribadi pengguna.
2. Ikuti pola komponen, CSS, dan provider yang sudah digunakan.
3. Jaga perubahan tetap terfokus dan tidak mengubah data localStorage tanpa migrasi.
4. Jalankan `npm run lint` dan `npm run build` sebelum membuka pull request.
