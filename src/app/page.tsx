import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { generateInitialTrafficData, generateLatestVehicleCounts } from '@/lib/data';

export default function Home() {
  const initialTrafficData = generateInitialTrafficData();
  const initialVehicleCounts = generateLatestVehicleCounts();
  
  return (
    <DashboardClient 
      initialTrafficData={initialTrafficData} 
      initialVehicleCounts={initialVehicleCounts} 
    />
  );
}
