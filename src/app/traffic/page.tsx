
import type { Metadata } from 'next';
import { TrafficDashboard } from '@/components/traffic/traffic-dashboard';

export const metadata: Metadata = {
  title: 'Dasbor Lalu Lintas',
  description: 'Analisis mendalam dari satu umpan video aktif, menampilkan statistik deteksi, volume kendaraan per jenis, dan grafik volume kumulatif.',
};

export default function TrafficPage() {
  return (
    <TrafficDashboard />
  );
}
