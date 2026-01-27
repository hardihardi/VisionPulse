# VisionPulse: Dasbor Analisis Lalu Lintas Cerdas

VisionPulse adalah aplikasi web dasbor analitik canggih yang dirancang untuk memantau, menganalisis, dan melaporkan data lalu lintas secara real-time. Dibangun dengan tumpukan teknologi modern, aplikasi ini memanfaatkan kecerdasan buatan (AI) untuk meningkatkan akurasi deteksi plat nomor, menganalisis video, dan memberikan ringkasan lalu lintas yang cerdas.

Aplikasi ini merupakan prototipe fungsional yang mensimulasikan analisis data lalu lintas dari sumber video file maupun URL, menyajikan hasilnya dalam dasbor yang interaktif dan responsif.

## Fitur Utama

-   **Dasbor Analisis Terpadu**: Halaman utama menyajikan antarmuka terpadu untuk analisis video lalu lintas. Menampilkan pemutar video, statistik real-time, dan berbagai panel kontrol dalam satu layar yang efisien.
-   **Manajemen Sumber Video Fleksibel**: Kelola daftar sumber video Anda dengan mudah. Tambah, sunting, dan hapus sumber video baik dari unggahan file lokal (MP4, AVI) maupun URL (misalnya, YouTube). Riwayat dan video aktif disimpan secara persisten di browser Anda.
-   **Analisis Video Berbasis AI**:
    -   **Deteksi Plat Nomor**: Ekstrak nomor plat dari video menggunakan AI. Hasil deteksi akan ditampilkan secara real-time selama analisis berlangsung.
    -   **Ringkasan Video Cerdas**: Hasilkan laporan analisis terstruktur dari video yang diunggah, mencakup ringkasan naratif, tingkat kepadatan, waktu puncak, dan distribusi jenis kendaraan.
-   **Visualisasi Data Interaktif**:
    -   Berbagai grafik seperti *Traffic Counting*, *Moving Average*, *Perbandingan Volume Kendaraan*, dan *Volume Kumulatif* diperbarui secara real-time selama analisis berjalan.
    -   Semua grafik dapat diekspor sebagai gambar PNG.
-   **Pencarian Plat Nomor**: Cari riwayat deteksi plat nomor di seluruh video yang tersimpan di database Firebase Firestore.
-   **Kustomisasi Analisis**: Sesuaikan koefisien SKR (Satuan Kendaraan Roda Empat) untuk setiap jenis kendaraan (Sepeda Motor, Mobil, Bus, Truk, Trailer) untuk analisis yang sesuai dengan standar lokal.
-   **Ekspor Laporan Lengkap**: Ekspor data agregat dari analisis dalam format XLSX dan CSV untuk pengolahan data lebih lanjut.
-   **Desain Responsif & Mode Gelap/Terang**: Antarmuka modern yang beradaptasi dengan baik di perangkat desktop dan seluler, dengan dukungan tema terang dan gelap.

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
│   ├── app/                  # Rute aplikasi utama
│   │   ├── (actions)/        # Next.js Server Actions untuk interaksi dengan AI
│   │   ├── history/          # Halaman Manajemen Sumber Video
│   │   ├── plate-search/     # Halaman Pencarian Plat Nomor
│   │   ├── layout.tsx        # Layout root aplikasi
│   │   └── page.tsx          # Halaman utama (Dasbor Analisis Lalu Lintas)
│   ├── ai/                   # Konfigurasi dan alur kerja Genkit
│   │   ├── flows/            # Alur kerja AI (misal: ringkasan, deteksi plat)
│   │   └── genkit.ts         # Inisialisasi utama Genkit
│   ├── components/           # Komponen React yang dapat digunakan kembali
│   │   ├── dashboard/        # Komponen-komponen pendukung dasbor
│   │   ├── layout/           # Komponen layout (misal: sidebar, theme-toggle)
│   │   ├── traffic/          # Komponen utama untuk dasbor analisis lalu lintas
│   │   └── ui/               # Komponen UI dari ShadCN (Button, Card, dll.)
│   ├── hooks/                # Custom React Hooks (misal: useVideoHistory, useToast)
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
File konfigurasi Firebase juga perlu diperbarui di `src/lib/firebase.ts` jika Anda tidak menggunakan variabel lingkungan.

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
