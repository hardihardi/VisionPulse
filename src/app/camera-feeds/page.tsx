import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Halaman Dihapus',
  description: 'Halaman ini telah dihapus.',
};

export default function RemovedCameraFeedsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Halaman Telah Dihapus</h1>
      <p className="text-muted-foreground mb-6">
        Fungsionalitas umpan kamera terpusat tidak lagi tersedia.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Kembali ke Dasbor Utama
      </Link>
    </div>
  );
}
