"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TrafficTrendsChart } from '@/components/dashboard/traffic-trends-chart';
import { VideoInput } from '@/components/dashboard/video-input';
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
        // Keep the data to a reasonable size, e.g., last 3 hours (36 points)
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
      <div className="flex min-h-screen w-full">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
            <DashboardHeader />
            <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Live Vehicle Count" 
                  value={latestData?.licensePlates.toString() || '0'}
                  icon={<Car />}
                  change="+5.2%"
                />
                <StatsCard 
                  title="Live PCU" 
                  value={Math.round(livePcu).toString()}
                  icon={<Users />}
                  change="+3.1%"
                />
                <StatsCard 
                  title="Avg. Speed" 
                  value="45 km/h"
                  icon={<Truck />}
                  change="-1.2%"
                />
                <StatsCard 
                  title="Anomaly Events" 
                  value="2"
                  icon={<Zap />}
                  change="+1"
                  variant='destructive'
                />
              </div>
              <div className="lg:col-span-3">
                <TrafficTrendsChart data={trafficData} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-6">
                <VideoInput />
                <AiSummary trafficData={trafficData} />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
