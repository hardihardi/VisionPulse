
import type { Metadata } from 'next';
import { TrafficDashboard } from '@/components/traffic/traffic-dashboard';

export const metadata: Metadata = {
  title: 'Dasbor Utama - Analisis Lalu Lintas',
  description: 'Analisis lalu lintas detail dengan pemantauan video, statistik real-time, volume kendaraan, deteksi anomali, dan fungsionalitas ekspor laporan.',
};

export default function HomePage() {
  return (
    <TrafficDashboard />
  );
}
