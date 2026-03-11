# VisionPulse: Dasbor Analisis Lalu Lintas Cerdas

Aplikasi ini merupakan sistem deteksi dan analisis lalu lintas real-time yang menggunakan Computer Vision (YOLOv8) untuk menghitung volume kendaraan, klasifikasi, dan analisis Satuan Kendaraan Roda Empat (SKR).

## Arsitektur Sistem

Sistem ini terdiri dari dua komponen utama:
1.  **Frontend (Next.js)**: Antarmuka pengguna untuk visualisasi data, kontrol sistem, dan manajemen riwayat video.
2.  **Backend (Python Flask)**: Mesin pemrosesan video yang menggunakan YOLOv8 untuk deteksi objek dan tracking secara real-time.

## Fitur Utama

-   **Deteksi & Tracking Real-time**: Menggunakan YOLOv8 untuk mendeteksi dan melacak kendaraan (Motor, Mobil, Bus, Truk) melalui video file atau stream URL (termasuk YouTube).
-   **Penghitungan Berbasis Arah**: Menghitung kendaraan yang melewati garis virtual dalam dua arah: Mendekat (Approaching) dan Menjauh (Departing).
-   **Analisis SKR (PCU)**: Konversi otomatis jumlah kendaraan ke Satuan Kendaraan Roda Empat (SKR) dengan koefisien yang dapat disesuaikan.
-   **Moving Average Analysis**: Menampilkan tren volume lalu lintas menggunakan rerata bergerak (SKR/jam) untuk mengurangi fluktuasi jangka pendek.
-   **Dasbor Interaktif**: Visualisasi data real-time menggunakan Recharts, termasuk grafik kumulatif dan perbandingan volume.
-   **Ekspor Laporan**: Ekspor data agregat dalam format XLSX dan CSV untuk pengolahan data lebih lanjut.

## Deployment ke Render (Satu-Klik)

Proyek ini sudah dilengkapi dengan file `render.yaml` (Blueprint) untuk memudahkan deployment otomatis ke Render.

1.  Push kode Anda ke GitHub.
2.  Buka [Render Dashboard](https://dashboard.render.com/).
3.  Pilih **New** > **Blueprint**.
4.  Hubungkan repositori GitHub Anda.
5.  Render akan otomatis mendeteksi konfigurasi untuk:
    -   **Backend**: Python API dengan pemrosesan YOLO.
    -   **Frontend**: Aplikasi Next.js yang terhubung ke backend tersebut.
6.  Pastikan untuk mengisi variabel lingkungan yang diperlukan (lihat `.env.example`).

## Menjalankan Proyek Secara Lokal

### 1. Persiapan Backend (Python)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Backend akan berjalan di `http://localhost:5000`.

### 2. Persiapan Frontend (Next.js)

```bash
# Di root direktori
npm install
cp .env.example .env
# Edit .env dan pastikan NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
npm run dev
```
Frontend akan berjalan di `http://localhost:9002`.

## Struktur Proyek Utama

- `/src`: Kode sumber frontend (Next.js, Components, Hooks).
- `/backend`: Kode sumber pemrosesan AI (Flask, YOLO logic, Traffic Counter).
- `render.yaml`: Konfigurasi deployment otomatis.
- `apphosting.yaml`: Konfigurasi Firebase App Hosting.

## Tumpukan Teknologi

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, ShadCN UI, Recharts.
- **Backend**: Python 3.12, Flask, OpenCV, YOLOv8 (Ultralytics), Pandas.
- **AI**: Google Genkit & Gemini API (untuk analisis tambahan).
- **Database**: Firebase Firestore.

---
Dokumentasi ini memberikan panduan lengkap untuk memahami, menjalankan, dan mengembangkan aplikasi VisionPulse lebih lanjut.
