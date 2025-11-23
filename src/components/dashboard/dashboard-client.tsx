
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

interface DashboardClientProps {
  initialTrafficData: TrafficDataPoint[];
  initialVehicleCounts: VehicleCount[];
}

export function DashboardClient({ initialTrafficData, initialVehicleCounts }: DashboardClientProps) {
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>(initialTrafficData);
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCount[]>(initialVehicleCounts);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prevData => {
        const newData = [...prevData, generateNewDataPoint(prevData)];
        if (newData.length > 40) {
          return newData.slice(newData.length - 40);
        }
        return newData;
      });
      setVehicleCounts(generateLatestVehicleCounts());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const latestData = useMemo(() => trafficData[trafficData.length - 1], [trafficData]);
  const livePcu = useMemo(() => vehicleCounts.reduce((acc, v) => acc + v.count * v.pcuFactor, 0), [vehicleCounts]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
            <DashboardHeader title="Dasbor Utama" description="Analisis lalu lintas dan ringkasan data." />
            <main className="grid flex-1 items-start gap-4 sm:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="grid w-full auto-rows-max gap-4 sm:gap-6 md:col-span-2 lg:col-span-3 xl:col-span-4 lg:grid-cols-4">
                <StatsCard 
                  title="Live Vehicle Count" 
                  value={latestData?.licensePlates.toString() || '0'}
                  icon={<Car />}
                  change="+5.2%"
                />
                <StatsCard 
                  title="Live SKR (Satuan Kendaraan Roda Empat)" 
                  value={Math.round(livePcu).toString()}
                  icon={<Users />}
                  change="+3.1%"
                />
                <StatsCard 
                  title="Kecepatan Rata-Rata" 
                  value="45 km/h"
                  icon={<Truck />}
                  change="-1.2%"
                />
                <StatsCard 
                  title="Peristiwa Anomali" 
                  value="2"
                  icon={<Zap />}
                  change="+1"
                  variant='destructive'
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-3">
                <TrafficTrendsChart data={trafficData} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-6">
                <AiSummary trafficData={trafficData} />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
