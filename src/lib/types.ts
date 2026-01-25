

export interface TrafficDataPoint {
  timestamp: number;
  licensePlates: number;
  pcu: number;
}

export interface VehicleCount {
  type: 'Car' | 'Motorcycle' | 'Bus' | 'Truck';
  count: number;
  pcuFactor: number;
}

export interface PcuCoefficients {
  sepedaMotor: number;
  mobil: number;
  bus: number;
  truk: number;
  trailer: number;
}

export interface CameraData {
  id: string;
  location: string;
  vehicles: number;
}

export interface VideoHistoryItem {
    id: string;
    name: string;
    source: {
        type: 'file';
        file: File;
    } | {
        type: 'url';
        url: string;
    };
}


export interface VehicleStats {
  name: string;
  count: number;
  pcu: number;
  progress: number;
}

export interface Detection {
  id?: string;
  plate: string;
  timestamp: Date;
  videoName: string;
  videoId: string;
}

export interface Anomaly {
  id: string;
  description: string;
  location: string;
  timestamp: number;
  severity: 'high' | 'medium' | 'low';
}
