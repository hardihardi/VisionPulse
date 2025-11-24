
"use client"

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import type { PcuCoefficients, VideoHistoryItem } from '@/lib/types';
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
import { RealtimeDetectionStats } from './realtimedetection-stats';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Upload } from 'lucide-react';
import { useVideoHistory } from '@/hooks/use-video-history';

const initialCoefficients: PcuCoefficients = {
    sepedaMotor: 0.4,
    mobil: 1.0,
    bus: 1.5,
    truk: 2.0,
};

export function TrafficDashboard() {
  const { currentVideo, videoSrc, loadVideo, toBase64 } = useVideoHistory();
  const [status, setStatus] = useState<SystemStatus>("STOPPED");
  const [detectionResult, setDetectionResult] = useState<EnhanceLicensePlateRecognitionOutput | null>(null);
  const [pcuCoefficients, setPcuCoefficients] = useState<PcuCoefficients>(initialCoefficients);
  const placeholder = PlaceHolderImages.find(img => img.id === 'traffic-feed-detected');
  
  const { toast } = useToast();

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  const handleStatusChange = async (newStatus: SystemStatus) => {
    if (newStatus === 'STARTED' && currentVideo?.file) {
        setStatus('ANALYZING');
        setDetectionResult(null);

        try {
          const videoDataUri = await toBase64(currentVideo.file);
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
        } catch (error: any) {
           toast({
                title: "Gagal Memproses Video",
                description: error.message || "File video tidak ditemukan atau rusak. Silakan unggah kembali di halaman Riwayat.",
                variant: "destructive",
            });
            setStatus('STOPPED');
        }
    } else if (newStatus === 'STOPPED') {
        setStatus('STOPPED');
        setDetectionResult(null);
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
                <Card>
                  <CardHeader>
                      <CardTitle>{currentVideo?.name || 'Video Lalu Lintas'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="aspect-video overflow-hidden rounded-md relative bg-muted">
                      {videoSrc ? (
                          <video src={videoSrc} className="w-full h-full object-cover" controls autoPlay loop muted />
                      ) : placeholder && (
                          <div className='w-full h-full flex flex-col items-center justify-center text-center'>
                            <Image 
                                src={placeholder.imageUrl} 
                                alt={placeholder.description} 
                                width={600}
                                height={400}
                                className="object-cover opacity-20"
                                data-ai-hint={placeholder.imageHint}
                            />
                             <p className="absolute text-muted-foreground">Tidak ada video aktif. Silakan unggah di halaman Riwayat.</p>
                          </div>
                      )}
                      </div>
                  </CardContent>
              </Card>
                <TrafficCountingChart />
                <PcuCoefficient coefficients={pcuCoefficients} onUpdate={setPcuCoefficients} />
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <ControlStatus 
                    isStartEnabled={!!currentVideo}
                    status={status}
                    onStatusChange={handleStatusChange}
                />
                <RealtimeDetectionStats isAnalyzing={status === 'ANALYZING' || status === 'STARTED'} />
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
