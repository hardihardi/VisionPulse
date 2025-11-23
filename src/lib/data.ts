import type { TrafficDataPoint, VehicleCount } from '@/lib/types';

// Generate mock data for the last 3 hours
export function generateInitialTrafficData(): TrafficDataPoint[] {
  const data: TrafficDataPoint[] = [];
  const now = new Date();
  const threeHoursAgo = now.getTime() - 3 * 60 * 60 * 1000;

  for (let time = threeHoursAgo; time <= now.getTime(); time += 5 * 60 * 1000) { // data point every 5 mins
    const date = new Date(time);
    const hour = date.getHours();

    // Simulate rush hours
    let basePlates = 30;
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      basePlates = 100;
    }
    
    const licensePlates = Math.floor(basePlates + Math.random() * 20 - 10);
    const pcu = Math.floor(licensePlates * (1.2 + Math.random() * 0.6));

    data.push({ timestamp: time, licensePlates, pcu });
  }
  return data;
}

export function generateLatestVehicleCounts(): VehicleCount[] {
    return [
        { type: 'Car', count: Math.floor(Math.random() * 50) + 20, pcuFactor: 1.0 },
        { type: 'Motorcycle', count: Math.floor(Math.random() * 30) + 10, pcuFactor: 0.5 },
        { type: 'Bus', count: Math.floor(Math.random() * 5) + 1, pcuFactor: 3.0 },
        { type: 'Truck', count: Math.floor(Math.random() * 10) + 2, pcuFactor: 2.5 },
    ];
}

export function generateNewDataPoint(previousData: TrafficDataPoint[]): TrafficDataPoint {
  const lastPoint = previousData[previousData.length - 1];
  const newTimestamp = lastPoint.timestamp + 5 * 60 * 1000;
  const date = new Date(newTimestamp);
  const hour = date.getHours();

  let basePlates = 30;
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    basePlates = 100;
  }
  
  const licensePlates = Math.max(0, Math.floor(basePlates + Math.random() * 20 - 10));
  const pcu = Math.max(0, Math.floor(licensePlates * (1.2 + Math.random() * 0.6)));

  return { timestamp: newTimestamp, licensePlates, pcu };
}
