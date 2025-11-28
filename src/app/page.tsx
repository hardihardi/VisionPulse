
import type { Metadata } from 'next';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { generateInitialTrafficData, generateLatestVehicleCounts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Dasbor Utama',
  description: 'Tampilan ringkas metrik lalu lintas utama seperti total kendaraan, SKR rata-rata, dan peristiwa anomali.',
};

export default function Home() {
  // Generate initial data using the default profile. The client will then update it based on location.
  const initialTrafficData = generateInitialTrafficData();
  const initialVehicleCounts = generateLatestVehicleCounts();
  
  return (
    <DashboardClient
      initialTrafficData={initialTrafficData} 
      initialVehicleCounts={initialVehicleCounts} 
    />
  );
}
