
import type { TrafficDataPoint, VehicleCount, CameraData, Anomaly } from '@/lib/types';

// --- Traffic Simulation Profiles ---
export interface TrafficProfile {
  name: string;
  baseVehicleCount: number;
  rushHourMultiplier: number;
  rushHours: { start: number; end: number }[];
  pcuFactor: number;
  anomalyMultiplier: number;
  averageSpeed: number;
}

const trafficProfiles: Record<string, TrafficProfile> = {
  jakarta: {
    name: 'Jakarta',
    baseVehicleCount: 60,
    rushHourMultiplier: 2.5,
    rushHours: [
      { start: 7, end: 10 },
      { start: 16, end: 20 },
    ],
    pcuFactor: 1.5,
    anomalyMultiplier: 1.8,
    averageSpeed: 35,
  },
  bandung: {
    name: 'Bandung',
    baseVehicleCount: 40,
    rushHourMultiplier: 2.2,
    rushHours: [
      { start: 7, end: 9 },
      { start: 16, end: 19 },
    ],
    pcuFactor: 1.3,
    anomalyMultiplier: 1.9,
    averageSpeed: 42,
  },
  surabaya: {
    name: 'Surabaya',
    baseVehicleCount: 50,
    rushHourMultiplier: 2.0,
    rushHours: [
      { start: 7, end: 9 },
      { start: 17, end: 19 },
    ],
    pcuFactor: 1.4,
    anomalyMultiplier: 2.0,
    averageSpeed: 50,
  },
  default: {
    name: 'Default',
    baseVehicleCount: 30,
    rushHourMultiplier: 2.0,
    rushHours: [
      { start: 8, end: 9 },
      { start: 17, end: 18 },
    ],
    pcuFactor: 1.2,
    anomalyMultiplier: 2.2,
    averageSpeed: 45,
  },
};

export function getTrafficProfile(city: string): TrafficProfile {
  const lowerCity = city.toLowerCase();
  if (lowerCity.includes('jakarta')) return trafficProfiles.jakarta;
  if (lowerCity.includes('bandung')) return trafficProfiles.bandung;
  if (lowerCity.includes('surabaya')) return trafficProfiles.surabaya;
  return trafficProfiles.default;
}

// Generate mock data for the last 3 hours
export function generateInitialTrafficData(): TrafficDataPoint[] {
  const data: TrafficDataPoint[] = [];
  const now = new Date();
  const threeHoursAgo = now.getTime() - 3 * 60 * 60 * 1000;
  const profile = getTrafficProfile('default'); // Start with default profile

  for (let time = threeHoursAgo; time <= now.getTime(); time += 5 * 60 * 1000) { // data point every 5 mins
    const date = new Date(time);
    const hour = date.getHours();

    let currentMultiplier = 1.0;
    for (const rush of profile.rushHours) {
        if(hour >= rush.start && hour <= rush.end) {
            currentMultiplier = profile.rushHourMultiplier;
            break;
        }
    }
    
    const licensePlates = Math.floor((profile.baseVehicleCount * currentMultiplier) + Math.random() * 20 - 10);
    const pcu = Math.floor(licensePlates * (profile.pcuFactor + Math.random() * 0.4));

    data.push({ timestamp: time, licensePlates, pcu });
  }
  return data;
}

export function generateLatestVehicleCounts(profile: TrafficProfile = getTrafficProfile('default')): VehicleCount[] {
    const carCount = Math.floor(profile.baseVehicleCount * 0.6 + Math.random() * 10);
    const motorCount = Math.floor(profile.baseVehicleCount * 1.5 + Math.random() * 20);
    return [
        { type: 'Car', count: carCount, pcuFactor: 1.0 },
        { type: 'Motorcycle', count: motorCount, pcuFactor: 0.5 },
        { type: 'Bus', count: Math.floor(carCount * 0.1), pcuFactor: 3.0 },
        { type: 'Truck', count: Math.floor(carCount * 0.15), pcuFactor: 2.5 },
    ];
}

export function generateNewDataPoint(previousData: TrafficDataPoint[], profile: TrafficProfile): TrafficDataPoint {
  const lastPoint = previousData[previousData.length - 1];
  const newTimestamp = lastPoint.timestamp + 5 * 60 * 1000;
  const date = new Date(newTimestamp);
  const hour = date.getHours();

  let currentMultiplier = 1.0;
  for (const rush of profile.rushHours) {
      if(hour >= rush.start && hour <= rush.end) {
          currentMultiplier = profile.rushHourMultiplier;
          break;
      }
  }
  
  const licensePlates = Math.max(0, Math.floor((profile.baseVehicleCount * currentMultiplier) + Math.random() * 20 - 10));
  const pcu = Math.max(0, Math.floor(licensePlates * (profile.pcuFactor + Math.random() * 0.4)));

  return { timestamp: newTimestamp, licensePlates, pcu };
}


// --- Camera Status Data ---
export const initialCameraData: CameraData[] = [
    { id: 'CAM-001', location: 'Main Street', vehicles: 45 },
    { id: 'CAM-002', location: 'Highway Exit', vehicles: 78 },
    { id: 'CAM-003', location: 'Shopping District', vehicles: 32 },
    { id: 'CAM-004', location: 'School Zone', vehicles: 0 },
    { id: 'CAM-005', location: 'Industrial Area', vehicles: 56 },
];

export function updateCameraData(camera: CameraData): CameraData {
    let change = Math.floor(Math.random() * 5) - 2; // -2 to +2
    
    // Make changes more significant for busy areas
    if (camera.location.includes('Highway') || camera.location.includes('Industrial')) {
        change = Math.floor(Math.random() * 10) - 4; // -4 to +5
    }

    if (camera.location.includes('School')) {
        // Less fluctuation, mostly 0 or small numbers during off-peak
        const hour = new Date().getHours();
        if (hour < 7 || hour > 16) {
           return { ...camera, vehicles: Math.floor(Math.random() * 3) };
        }
        change = Math.floor(Math.random() * 7) - 3;
    }
    
    if (camera.location.includes('Shopping')) {
        change = Math.floor(Math.random() * 8) - 3; // -3 to +4
    }


    const newCount = Math.max(0, camera.vehicles + change);
    return { ...camera, vehicles: newCount };
}

// --- Anomaly Data ---
const anomalyDescriptions = [
  "Kemacetan tiba-tiba terdeteksi",
  "Kendaraan berhenti di lokasi terlarang",
  "Potensi kecelakaan, lalu lintas melambat",
  "Objek tidak dikenal di jalan raya",
  "Pejalan kaki di area berbahaya",
];
const locations = ['CAM-001', 'CAM-002', 'CAM-003', 'CAM-004', 'CAM-005'];
const severities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];

export function generateAnomaly(currentLocation: string | undefined): Anomaly {
    return {
        id: `ANM-${Date.now()}-${Math.random()}`,
        description: anomalyDescriptions[Math.floor(Math.random() * anomalyDescriptions.length)],
        location: currentLocation || locations[Math.floor(Math.random() * locations.length)],
        timestamp: Date.now(),
        severity: severities[Math.floor(Math.random() * severities.length)],
    };
}
