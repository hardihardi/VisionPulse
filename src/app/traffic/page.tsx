
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Halaman Tidak Digunakan',
  description: 'Halaman ini tidak lagi digunakan.',
};

export default function DeprecatedTrafficPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Halaman Telah Dipindahkan</h1>
      <p className="text-muted-foreground mb-6">
        Fungsionalitas dasbor lalu lintas sekarang berada di halaman utama.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Kembali ke Dasbor Utama
      </Link>
    </div>
  );
}
