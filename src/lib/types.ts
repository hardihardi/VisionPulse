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
