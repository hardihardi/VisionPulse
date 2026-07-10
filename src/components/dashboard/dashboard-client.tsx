
"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrafficTrendsChart } from '@/components/dashboard/traffic-trends-chart';
import { AiSummary } from '@/components/dashboard/ai-summary';
import { generateNewDataPoint, generateLatestVehicleCounts, getTrafficProfile, TrafficProfile } from '@/lib/data';
import type { TrafficDataPoint, VehicleCount } from '@/lib/types';
import { Car, Users, Truck, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CameraStatusCard } from './camera-status-card';
import { AiPrediction } from './ai-prediction';


type TimeFrame = 'live' | '15min' | '1hour' | 'daily';

export function DashboardClient({ initialTrafficData, initialVehicleCounts }: { initialTrafficData: TrafficDataPoint[], initialVehicleCounts: VehicleCount[] }) {
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>(initialTrafficData);
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCount[]>(initialVehicleCounts);
  const [locationName, setLocationName] = useState<string>("Mendeteksi lokasi...");
  const [trafficProfile, setTrafficProfile] = useState<TrafficProfile>(getTrafficProfile('default'));
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('live');
  const [anomalyCount, setAnomalyCount] = useState(0);
  const { toast } = useToast();

  // Location Detection and Profile Selection
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await response.json();
          const { city, suburb, town, village, county, state } = data.address;
          const detectedCity = city || state || "Unknown";
          
          const profile = getTrafficProfile(detectedCity);
          setTrafficProfile(profile);

          const locationDisplayName = suburb || city || town || village || county || state || "Lokasi Tidak Dikenal";
          setLocationName(locationDisplayName);
          
           toast({
            title: "Profil Lalu Lintas Dimuat",
            description: `Menggunakan profil lalu lintas untuk ${profile.name}.`,
          });

        } catch (error) {
          console.error("Error fetching location name", error);
          setLocationName("Jakarta"); // Fallback
          setTrafficProfile(getTrafficProfile('Jakarta'));
        }
      },
      () => {
        setLocationName("Jakarta"); // Fallback on permission denial
        setTrafficProfile(getTrafficProfile('Jakarta'));
      }
    );
  }, [toast]);

  // Live Data Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      let anomalyDetected = false;
      let anomalyDescription = "";

      setTrafficData(prevData => {
        const newDataPoint = generateNewDataPoint(prevData, trafficProfile);
        
        // Simple anomaly detection logic
        if (Math.random() < 0.1) { // 10% chance of anomaly
            const lastPoint = prevData[prevData.length-1];
            if (lastPoint && newDataPoint.pcu > lastPoint.pcu * trafficProfile.anomalyMultiplier) {
                anomalyDetected = true;
                anomalyDescription = `Kemacetan tiba-tiba terdeteksi di ${locationName}.`;
            } else if (Math.random() < 0.3) { // Nested chance for other type
                 anomalyDetected = true;
                 anomalyDescription = `Kendaraan berhenti di lokasi terlarang terdeteksi di ${locationName}.`;
            }
        }
        
        const newData = [...prevData, newDataPoint];
        // Keep the last 24 hours of data (288 points * 5 mins)
        if (newData.length > 288) {
          return newData.slice(newData.length - 288);
        }
        return newData;
      });
      setVehicleCounts(generateLatestVehicleCounts(trafficProfile));

      if (anomalyDetected) {
          setAnomalyCount(prev => prev + 1);
          toast({
              title: "Peringatan Anomali Real-Time",
              description: anomalyDescription,
              variant: "destructive"
          });
      }

    }, 5000);

    return () => clearInterval(interval);
  }, [locationName, toast, trafficProfile]);

  const filteredData = useMemo(() => {
    const now = Date.now();
    switch (timeFrame) {
      case '15min':
        return trafficData.filter(d => now - d.timestamp < 15 * 60 * 1000);
      case '1hour':
        return trafficData.filter(d => now - d.timestamp < 60 * 60 * 1000);
      case 'daily':
        return trafficData; // Shows all data (up to 24h)
      case 'live':
      default:
        // Show last 30 minutes for a "live" feel
        return trafficData.filter(d => now - d.timestamp < 30 * 60 * 1000);
    }
  }, [trafficData, timeFrame]);

  const totalVehicles = useMemo(() => filteredData.reduce((sum, d) => sum + d.licensePlates, 0), [filteredData]);
  const averagePcu = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const totalPcu = filteredData.reduce((sum, d) => sum + d.pcu, 0);
    return Math.round(totalPcu / filteredData.length);
  }, [filteredData]);
  
  const averageSpeed = useMemo(() => trafficProfile.averageSpeed, [trafficProfile]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <DashboardHeader 
              title="Dasbor Utama" 
              description={`Analisis lalu lintas dan ringkasan data untuk ${locationName}.`} 
            />
            <main className="grid flex-1 items-start gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="grid w-full auto-rows-max gap-6 col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard 
                  title="Total Kendaraan" 
                  value={totalVehicles.toString()}
                  icon={<Car />}
                  change={timeFrame !== 'live' ? `Dalam ${timeFrame === '15min' ? '15 Menit' : timeFrame === '1hour' ? '1 Jam' : '24 Jam'}`: 'Jumlah live'}
                />
                <StatsCard 
                  title="Rata-rata SKR" 
                  value={averagePcu.toString()}
                  icon={<Users />}
                  change={timeFrame !== 'live' ? `Dalam ${timeFrame === '15min' ? '15 Menit' : timeFrame === '1hour' ? '1 Jam' : '24 Jam'}`: 'SKR live'}
                />
                <StatsCard 
                  title="Kecepatan Rata-Rata" 
                  value={`${averageSpeed} km/h`}
                  icon={<Truck />}
                  change={`Estimasi (${trafficProfile.name})`}
                />
                <StatsCard 
                  title="Peristiwa Anomali" 
                  value={anomalyCount.toString()}
                  icon={<Zap />}
                  change="Dalam sesi ini"
                  variant='destructive'
                />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <TrafficTrendsChart 
                  data={filteredData} 
                  timeFrame={timeFrame}
                  onTimeFrameChange={setTimeFrame}
                />
              </div>
              <div className="col-span-1 flex flex-col gap-6">
                <AiSummary trafficData={filteredData} />
                <AiPrediction trafficData={trafficData} locationName={locationName} />
                <CameraStatusCard />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
