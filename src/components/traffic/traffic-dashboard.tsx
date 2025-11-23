
"use client"

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import type { PcuCoefficients } from '@/lib/types';
import { ControlStatus, SystemStatus } from './control-status';
import { VehicleVolume } from './vehicle-volume';
import { ExportReport } from './export-report';
import { TrafficCountingChart } from './traffic-counting-chart';
import { MovingAverageChart } from './moving-average-chart';
import { PcuCoefficient } from './pcu-coefficient';
import { CumulativeVolumeChart } from './cumulative-volume-chart';
import { getEnhancedRecognition } from '@/app/(actions)/enhance-recognition';
import { useToast } from '@/hooks/use-toast';
import { EnhanceLicensePlateRecognitionOutput } from '@/ai/flows/enhance-license-plate-recognition';
import { VideoInput } from '@/components/dashboard/video-input';
import { DetectionResultCard } from '../dashboard/detection-result-card';

const initialCoefficients: PcuCoefficients = {
    sepedaMotor: 0.4,
    mobil: 1.0,
    bus: 1.5,
    truk: 2.0,
};

export function TrafficDashboard() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<SystemStatus>("STOPPED");
  const [detectionResult, setDetectionResult] = useState<EnhanceLicensePlateRecognitionOutput | null>(null);
  const [pcuCoefficients, setPcuCoefficients] = useState<PcuCoefficients>(initialCoefficients);

  const { toast } = useToast();

  const handleVideoSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setStatus("STOPPED");
    setDetectionResult(null);
  };
  
  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleStatusChange = async (newStatus: SystemStatus) => {
    if (newStatus === 'STARTED' && videoFile) {
        setStatus('ANALYZING');
        setDetectionResult(null);

        try {
          const videoDataUri = await toBase64(videoFile);
          const result = await getEnhancedRecognition({ videoDataUri });

          if (result.error) {
              toast({
                  title: "Deteksi Gagal",
                  description: result.error,
                  variant: "destructive",
              });
              setStatus('STOPPED');
          } else if (result.result) {
              toast({
                  title: "Deteksi Berhasil",
                  description: `Plat nomor terdeteksi: ${result.result.licensePlate}`,
              });
              setDetectionResult(result.result);
              setStatus('STARTED'); // Analysis complete
          }
        } catch (error) {
           toast({
                title: "Gagal Memproses Video",
                description: "Terjadi kesalahan saat membaca file video.",
                variant: "destructive",
            });
            setStatus('STOPPED');
        }
    } else if (newStatus === 'STOPPED') {
        setStatus('STOPPED');
        setDetectionResult(null);
        // Do not clear video source on stop, only on new upload or explicit clear
        if (!videoFile) {
          setVideoSrc(null);
        }
    } else {
        setStatus(newStatus);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <DashboardHeader title="Dasbor Lalu Lintas" description="Pemantauan dan kontrol sistem lalu lintas real-time." />
            <main className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <VideoInput onVideoSelect={handleVideoSelect} videoSrc={videoSrc} />
                <TrafficCountingChart />
                <PcuCoefficient coefficients={pcuCoefficients} onUpdate={setPcuCoefficients} />
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <ControlStatus 
                    isStartEnabled={!!videoFile}
                    status={status}
                    onStatusChange={handleStatusChange}
                />
                <DetectionResultCard detectionResult={detectionResult} />
                <VehicleVolume />
                <ExportReport />
              </div>
              
              <div className="lg:col-span-3">
                <MovingAverageChart />
              </div>
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
