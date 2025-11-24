
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrafficTrendsChart } from '@/components/dashboard/traffic-trends-chart';
import { AiSummary } from '@/components/dashboard/ai-summary';
import { generateNewDataPoint, generateLatestVehicleCounts } from '@/lib/data';
import type { TrafficDataPoint, VehicleCount } from '@/lib/types';
import { Car, Users, Truck, Zap } from 'lucide-react';
import { getTrafficSummary } from '@/app/(actions)/summarize';
import { useToast } from '@/hooks/use-toast';
import { CameraStatusCard } from './camera-status-card';


type TimeFrame = 'live' | '15min' | '1hour' | 'daily';

export function DashboardClient({ initialTrafficData, initialVehicleCounts }: { initialTrafficData: TrafficDataPoint[], initialVehicleCounts: VehicleCount[] }) {
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>(initialTrafficData);
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCount[]>(initialVehicleCounts);
  const [location, setLocation] = useState<string>("Mendeteksi lokasi...");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('live');

  // Location Detection
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Using a free, no-key reverse geocoding service.
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await response.json();
          const { city, suburb, town, village } = data.address;
          setLocation(suburb || city || town || village || "Lokasi Tidak Dikenal");
        } catch (error) {
          console.error("Error fetching location name", error);
          setLocation("Jakarta"); // Fallback
        }
      },
      () => {
        setLocation("Jakarta"); // Fallback on permission denial
      }
    );
  }, []);

  // Live Data Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prevData => {
        const newData = [...prevData, generateNewDataPoint(prevData)];
        // Keep the last 24 hours of data (288 points * 5 mins)
        if (newData.length > 288) {
          return newData.slice(newData.length - 288);
        }
        return newData;
      });
      setVehicleCounts(generateLatestVehicleCounts());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const latestData = useMemo(() => filteredData[filteredData.length - 1] || {}, [filteredData]);
  const livePcu = useMemo(() => vehicleCounts.reduce((acc, v) => acc + v.count * v.pcuFactor, 0), [vehicleCounts]);

  const totalVehicles = useMemo(() => filteredData.reduce((sum, d) => sum + d.licensePlates, 0), [filteredData]);
  const averagePcu = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const totalPcu = filteredData.reduce((sum, d) => sum + d.pcu, 0);
    return Math.round(totalPcu / filteredData.length);
  }, [filteredData]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
            <DashboardHeader 
              title="Dasbor Utama" 
              description={`Analisis lalu lintas dan ringkasan data untuk ${location}.`} 
            />
            <main className="grid flex-1 items-start gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="grid w-full auto-rows-max gap-4 sm:gap-6 md:col-span-2 lg:col-span-3 xl:col-span-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Total Kendaraan" 
                  value={totalVehicles.toString()}
                  icon={<Car />}
                  change={timeFrame !== 'live' ? `Dalam ${timeFrame === '15min' ? '15 Menit' : timeFrame === '1hour' ? '1 Jam' : '24 Jam'}`: 'Live count'}
                />
                <StatsCard 
                  title="Rata-rata SKR" 
                  value={averagePcu.toString()}
                  icon={<Users />}
                  change={timeFrame !== 'live' ? `Dalam ${timeFrame === '15min' ? '15 Menit' : timeFrame === '1hour' ? '1 Jam' : '24 Jam'}`: 'Live SKR'}
                />
                <StatsCard 
                  title="Kecepatan Rata-Rata" 
                  value="45 km/h"
                  icon={<Truck />}
                  change="Estimasi"
                />
                <StatsCard 
                  title="Peristiwa Anomali" 
                  value="2"
                  icon={<Zap />}
                  change="Dalam 24 jam terakhir"
                  variant='destructive'
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-3">
                <TrafficTrendsChart 
                  data={filteredData} 
                  timeFrame={timeFrame}
                  onTimeFrameChange={setTimeFrame}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-1 flex flex-col gap-6">
                <AiSummary trafficData={filteredData} />
                <CameraStatusCard />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
