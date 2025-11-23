import { TrafficDashboard } from '@/components/traffic/traffic-dashboard';
import { generateInitialTrafficData, generateLatestVehicleCounts } from '@/lib/data';

export default function Home() {
  const initialTrafficData = generateInitialTrafficData();
  const initialVehicleCounts = generateLatestVehicleCounts();
  
  return (
    <TrafficDashboard 
      initialTrafficData={initialTrafficData} 
      initialVehicleCounts={initialVehicleCounts} 
    />
  );
}
