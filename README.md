# VisionPulse: Dasbor Analisis Lalu Lintas Cerdas

Aplikasi ini merupakan sistem deteksi dan analisis lalu lintas real-time yang menggunakan Computer Vision (YOLOv8) untuk menghitung volume kendaraan, klasifikasi, dan analisis Satuan Kendaraan Roda Empat (SKR).

## Arsitektur Sistem

Sistem ini terdiri dari dua komponen utama:
1.  **Frontend (Next.js)**: Antarmuka pengguna untuk visualisasi data, kontrol sistem, dan manajemen riwayat video.
2.  **Backend (Python Flask)**: Mesin pemrosesan video yang menggunakan YOLOv8 untuk deteksi objek dan tracking secara real-time.

## Mode Operasional

Untuk fleksibilitas riset, aplikasi mendukung dua mode:
-   **Mode LIVE**: Menghubungkan frontend ke server Flask AI untuk pemrosesan video real-time dari kamera atau YouTube.
-   **Mode SIMULATION**: Mode riset mandiri yang menggunakan algoritma simulasi data untuk menghasilkan tren lalu lintas tanpa memerlukan server AI aktif. Berguna untuk demonstrasi UI dan riset strategis.

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

---
Dokumentasi ini memberikan panduan lengkap untuk memahami, menjalankan, dan mengembangkan aplikasi VisionPulse lebih lanjut.
