"use client"

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { VideoInput } from '@/components/dashboard/video-input';
import type { TrafficDataPoint, VehicleCount } from '@/lib/types';
import { ControlStatus } from './control-status';
import { VehicleVolume } from './vehicle-volume';
import { ExportReport } from './export-report';
import { TrafficCountingChart } from './traffic-counting-chart';
import { MovingAverageChart } from './moving-average-chart';
import { PcuCoefficient } from './pcu-coefficient';
import { CumulativeVolumeChart } from './cumulative-volume-chart';

interface TrafficDashboardProps {
  initialTrafficData: TrafficDataPoint[];
  initialVehicleCounts: VehicleCount[];
}

export function TrafficDashboard({ initialTrafficData, initialVehicleCounts }: TrafficDashboardProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <DashboardHeader />
            <main className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Left Column */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <VideoInput />
                <TrafficCountingChart />
                <PcuCoefficient />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <ControlStatus />
                <VehicleVolume />
                <ExportReport />
                <MovingAverageChart />
              </div>
              
              {/* Bottom full-width chart */}
              <div className="lg:col-span-3">
                <CumulativeVolumeChart />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
