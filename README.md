# VisionPulse: Dasbor Analisis Lalu Lintas Cerdas

VisionPulse adalah aplikasi web dasbor analitik canggih yang dirancang untuk memantau, menganalisis, dan melaporkan data lalu lintas secara real-time. Dibangun dengan tumpukan teknologi modern, aplikasi ini memanfaatkan kecerdasan buatan (AI) untuk meningkatkan akurasi deteksi plat nomor dan memberikan ringkasan lalu lintas yang cerdas.

## Fitur Utama

- **Dasbor Utama**: Tampilan ringkas metrik lalu lintas utama seperti total kendaraan, Satuan Kendaraan Roda Empat (SKR) rata-rata, dan peristiwa anomali.
- **Analisis Lalu Lintas Real-Time**: Halaman khusus untuk analisis mendalam dari satu umpan video aktif, menampilkan statistik deteksi, volume kendaraan per jenis, dan grafik volume kumulatif.
- **Umpan Kamera Terpusat**: Galeri yang menampilkan semua umpan kamera lalu lintas yang terhubung dalam bentuk video yang diputar otomatis, dengan penanda visual untuk anomali.
- **Penyimpanan & Manajemen Video**: Kemampuan untuk mengunggah file video atau menggunakan URL (misalnya, YouTube) sebagai sumber analisis. Sesi video terakhir disimpan untuk kemudahan akses.
- **Pencarian Plat Nomor Berbasis Database**: Setiap plat nomor yang terdeteksi secara otomatis disimpan ke Firebase Firestore. Halaman pencarian memungkinkan pengguna untuk mencari riwayat deteksi plat nomor di seluruh video.
- **Ringkasan Lalu Lintas Berbasis AI**: Menggunakan Genkit untuk menghasilkan ringkasan naratif dari pola lalu lintas berdasarkan data numerik.
- **Desain Responsif & Mode Gelap/Terang**: Antarmuka yang bersih dan modern yang beradaptasi dengan baik di perangkat desktop dan mobile, dengan dukungan tema terang dan gelap.

## Tumpukan Teknologi

- **Framework**: Next.js 15 (App Router)
- **Bahasa**: TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore (untuk riwayat deteksi plat nomor)
- **AI / Generative AI**: Google Genkit
- **Visualisasi Data**: Recharts
- **Manajemen Form**: React Hook Form & Zod
- **Deployment**: Firebase App Hosting (dikonfigurasi melalui `apphosting.yaml`)

## Struktur Proyek

Struktur folder utama proyek diatur untuk skalabilitas dan keterbacaan.

```
/
├── src/
│   ├── app/                  # Rute aplikasi utama (Pages & Layouts)
│   │   ├── (actions)/        # Next.js Server Actions (mirip API)
│   │   ├── api/              # (jika ada) API routes tradisional
│   │   ├── camera-feeds/     # Halaman Umpan Kamera
│   │   ├── history/          # Halaman Penyimpanan Video
│   │   ├── plate-search/     # Halaman Pencarian Plat
│   │   ├── traffic/          # Halaman Dasbor Lalu Lintas
│   │   ├── layout.tsx        # Layout root
│   │   └── page.tsx          # Halaman utama (Dasbor Utama)
│   ├── ai/                   # Konfigurasi dan alur kerja Genkit
│   │   ├── flows/            # Alur kerja AI (misal: ringkasan, deteksi)
│   │   └── genkit.ts         # Inisialisasi utama Genkit
│   ├── components/           # Komponen React yang dapat digunakan kembali
│   │   ├── dashboard/        # Komponen khusus untuk dasbor
│   │   ├── layout/           # Komponen layout (misal: sidebar)
│   │   ├── traffic/          # Komponen khusus untuk analisis lalu lintas
│   │   └── ui/               # Komponen UI dari ShadCN (Button, Card, dll.)
│   ├── hooks/                # Custom React Hooks (misal: useVideoHistory)
│   ├── lib/                  # Fungsi utilitas, definisi tipe, dan konfigurasi
│   │   ├── data.ts           # Fungsi untuk menghasilkan data simulasi
│   │   ├── firebase.ts       # Konfigurasi dan inisialisasi Firebase
│   │   ├── types.ts          # Definisi tipe TypeScript global
│   │   └── utils.ts          # Utilitas umum (misal: cn untuk classname)
├── public/                   # Aset statis
├── package.json              # Dependensi dan skrip proyek
└── tailwind.config.ts        # Konfigurasi Tailwind CSS
```

## Menjalankan Proyek Secara Lokal

Untuk menjalankan proyek ini di lingkungan pengembangan lokal Anda, ikuti langkah-langkah berikut:

### Prasyarat

- Node.js (v18 atau lebih baru)
- `npm` atau `yarn`

### 1. Kloning Repositori

```bash
git clone https://github.com/hardihardi/VisionPulse.git
cd VisionPulse
```

### 2. Instal Dependensi

Proyek ini menggunakan `npm` sebagai package manager.

```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan

Salin file `.env.example` (jika ada) menjadi `.env` dan isi dengan kredensial yang diperlukan, terutama untuk Firebase dan Genkit. Anda perlu membuat proyek Firebase sendiri untuk mendapatkan konfigurasi ini.

```
# .env
# Kredensial untuk Google Genkit / Google AI
GEMINI_API_KEY=AIzaSy...

# Informasi Firebase (ganti dengan konfigurasi proyek Firebase Anda)
# Anda bisa mendapatkan ini dari Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
File konfigurasi Firebase juga perlu diperbarui di `src/lib/firebase.ts`.

### 4. Jalankan Server Pengembangan

Setelah instalasi selesai, jalankan server pengembangan Next.js:

```bash
npm run dev
```

Aplikasi akan berjalan secara default di `http://localhost:9002`.

### 5. Jalankan Genkit (Opsional, untuk Pengembangan AI)

Jika Anda ingin memodifikasi atau memantau alur kerja AI secara real-time, jalankan Genkit UI:

```bash
npm run genkit:dev
```

Ini akan memulai server Genkit dan UI pengembangan yang dapat diakses di `http://localhost:4000`.

---
Dokumentasi ini memberikan panduan lengkap untuk memahami, menjalankan, dan mengembangkan aplikasi VisionPulse lebih lanjut.
