

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
