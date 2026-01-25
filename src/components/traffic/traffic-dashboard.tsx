'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import type { PcuCoefficients, Detection, Anomaly } from '@/lib/types';
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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useVideoHistory } from '@/hooks/use-video-history';
import { RealtimeDetectionStats } from './realtimedetection-stats';
import { DetectionResultCard } from '../dashboard/detection-result-card';
import { VehicleComparisonChart } from './vehicle-comparison-chart';
import { firestore } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateAnomaly } from '@/lib/data';
import { AnomalyDetectionCard } from './anomaly-detection-card';


const initialCoefficients: PcuCoefficients = {
  sepedaMotor: 0.25,
  mobil: 1.0,
  bus: 1.5,
  truk: 2.0,
  trailer: 2.5,
};

const generateTrafficCountData = () => {
    const data = [];
    const periods = ['00:00-00:15', '00:15-00:30', '00:30-00:45', '00:45-01:00'];
    
    for (const period of periods) {
        const mobilM = Math.floor(Math.random() * 20);
        const busM = Math.floor(Math.random() * 5);
        const trukM = Math.floor(Math.random() * 8);
        const motorM = Math.floor(Math.random() * 30);
        const trailerM = Math.floor(Math.random() * 4);
        
        const mobilJ = Math.floor(Math.random() * 18);
        const busJ = Math.floor(Math.random() * 4);
        const trukJ = Math.floor(Math.random() * 7);
        const motorJ = Math.floor(Math.random() * 25);
        const trailerJ = Math.floor(Math.random() * 3);

        const entry: { [key: string]: any } = { 
            name: period,
            'Mobil (M)': mobilM,
            'Bus (M)': busM,
            'Truk (M)': trukM,
            'Sepeda Motor (M)': motorM,
            'Trailer (M)': trailerM,
            'Mobil (J)': mobilJ,
            'Bus (J)': busJ,
            'Truk (J)': trukJ,
            'Sepeda Motor (J)': motorJ,
            'Trailer (J)': trailerJ,
            'Total Mendekat': mobilM + busM + trukM + motorM + trailerM,
            'Total Menjauh': mobilJ + busJ + trukJ + motorJ + trailerJ,
        };
        
        data.push(entry);
    }
    return data;
}

function getYouTubeEmbedUrl(url: string): string | null {
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
  } catch (e) {
    return null;
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  }
  return null;
}

// Function to generate a random Indonesian license plate
const generateRandomPlate = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const randomChar = (source: string) =>
    source[Math.floor(Math.random() * source.length)];
  const regionCode = ['B', 'D', 'L', 'N', 'F'][Math.floor(Math.random() * 5)];
  let plateNumber = '';
  for (let i = 0; i < 4; i++) plateNumber += randomChar(numbers);
  let series = '';
  for (let i = 0; i < 2; i++) series += randomChar(letters);

  return `${regionCode} ${plateNumber} ${series}`;
};

const saveDetection = async (detection: Omit<Detection, 'id' | 'timestamp'>) => {
  if (!firestore) {
    console.error("Firestore is not initialized.");
    return;
  }
  try {
    await addDoc(collection(firestore, 'detections'), {
      ...detection,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error writing document: ", error);
  }
};


export function TrafficDashboard() {
  const { activeVideo, videoSrc, toBase64 } = useVideoHistory();
  const [status, setStatus] = useState<SystemStatus>('STOPPED');
  const [detectionResult, setDetectionResult] =
    useState<EnhanceLicensePlateRecognitionOutput | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [pcuCoefficients, setPcuCoefficients] =
    useState<PcuCoefficients>(initialCoefficients);
  const [trafficCountData, setTrafficCountData] = useState<any[]>([]);
  const placeholder = PlaceHolderImages.find(
    (img) => img.id === 'traffic-feed-detected'
  );
  const trafficCountingChartRef = useRef<HTMLDivElement>(null);
  const movingAverageChartRef = useRef<HTMLDivElement>(null);
  const vehicleComparisonChartRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const isAnalyzing = status === 'ANALYZING' || status === 'STARTED';

  // Effect for auto-starting analysis when video changes
  useEffect(() => {
    if (activeVideo) {
      handleStatusChange('STARTED');
    } else {
      handleStatusChange('STOPPED');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideo]);

  // Effect to save detection result to Firestore
  useEffect(() => {
    if (detectionResult && activeVideo) {
      saveDetection({
        plate: detectionResult.licensePlate,
        videoName: activeVideo.name,
        videoId: activeVideo.id,
      });
    }
  }, [detectionResult, activeVideo]);


  // Effect for real-time simulation update
  useEffect(() => {
    let simulationInterval: NodeJS.Timeout | undefined;
    let dataGenerationInterval: NodeJS.Timeout | undefined;
    let anomalyInterval: NodeJS.Timeout | undefined;

    if (isAnalyzing) {
        // Run once at the beginning
        setTrafficCountData(generateTrafficCountData());
        setAnomalies([]);

        // Then set an interval
        dataGenerationInterval = setInterval(() => {
            setTrafficCountData(generateTrafficCountData());
        }, 5000); // Update data every 5 seconds
        
        anomalyInterval = setInterval(() => {
          if (Math.random() < 0.3) { // 30% chance to generate an anomaly
            const newAnomaly = generateAnomaly(activeVideo?.name);
            setAnomalies(prev => [newAnomaly, ...prev].slice(0, 5)); // Keep last 5
          }
        }, 7000); // Check for anomalies every 7 seconds

        if (activeVideo?.source.type === 'url') {
            simulationInterval = setInterval(() => {
                const mockResult: EnhanceLicensePlateRecognitionOutput = {
                    licensePlate: generateRandomPlate(),
                    enhancementResult: 'Analisis simulasi dari stream URL berhasil.',
                    accuracyAchieved: `${(Math.random() * (99 - 85) + 85).toFixed(2)}%`,
                };
                setDetectionResult(mockResult);
            }, 4000); // Update every 4 seconds
        }
    } else {
        setTrafficCountData([]); // Clear data when stopped
        setAnomalies([]);
    }

    return () => {
      if (simulationInterval) clearInterval(simulationInterval);
      if (dataGenerationInterval) clearInterval(dataGenerationInterval);
      if (anomalyInterval) clearInterval(anomalyInterval);
    };
  }, [isAnalyzing, activeVideo]);

  const handleStatusChange = async (newStatus: SystemStatus) => {
    if (newStatus === 'STARTED') {
      if (!activeVideo) {
        toast({
          title: 'Analisis Gagal',
          description:
            'Tidak ada video aktif. Silakan pilih atau unggah video di halaman Riwayat.',
          variant: 'destructive',
        });
        return;
      }

      setDetectionResult(null);

      // If it's a URL, start the simulation loop
      if (activeVideo.source.type === 'url') {
        setStatus('ANALYZING');
        toast({
          title: 'Analisis Simulasi Dimulai',
          description: `Memulai pemantauan real-time dari stream URL.`,
        });
        return;
      }

      // If it's a file, proceed with the actual analysis
      if (activeVideo.source.type === 'file' && activeVideo.source.file) {
        setStatus('ANALYZING');
        try {
          const videoDataUri = await toBase64(activeVideo.source.file);
          const { result, error } = await getEnhancedRecognition({
            videoDataUri,
          });

          if (error) {
            toast({
              title: 'Deteksi Gagal',
              description: error,
              variant: 'destructive',
            });
            setStatus('STOPPED');
          } else if (result) {
            toast({
              title: 'Deteksi Berhasil',
              description: `Plat nomor terdeteksi: ${result.licensePlate}`,
            });
            setDetectionResult(result);
            setStatus('STARTED'); // Analysis complete for file
          }
        } catch (error: any) {
          toast({
            title: 'Gagal Memproses Video',
            description:
              error.message ||
              'File video tidak ditemukan atau rusak. Silakan unggah kembali di halaman Riwayat.',
            variant: 'destructive',
          });
          setStatus('STOPPED');
        }
      }
    } else if (newStatus === 'STOPPED') {
      setStatus('STOPPED');
      setDetectionResult(null);
    }
  };

  const renderVideoPlayer = () => {
    if (!videoSrc) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted relative">
                {placeholder && (
                    <Image
                        src={placeholder.imageUrl}
                        alt={placeholder.description}
                        fill
                        className="object-cover opacity-30"
                        data-ai-hint={placeholder.imageHint}
                    />
                )}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="text-center text-foreground bg-black/50 p-4 rounded-md">
                        Tidak ada video aktif. <br /> Silakan pilih atau unggah video di halaman Riwayat.
                    </p>
                </div>
            </div>
        );
    }

    const embedUrl = getYouTubeEmbedUrl(videoSrc);

    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      );
    }

    return (
      <video
        src={videoSrc}
        className="w-full h-full object-cover"
        controls
        autoPlay
        loop
        muted
      />
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <DashboardHeader
              title="Dasbor Lalu Lintas"
              description="Pemantauan dan kontrol sistem lalu lintas real-time."
            />
            <main className="grid gap-6 grid-cols-1 lg:grid-cols-4">
              <div className="lg:col-span-3 flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {activeVideo?.name || 'Video Lalu Lintas'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video overflow-hidden rounded-md relative bg-muted">
                      {renderVideoPlayer()}
                    </div>
                  </CardContent>
                </Card>
                <DetectionResultCard detectionResult={detectionResult} />
                <TrafficCountingChart ref={trafficCountingChartRef} isAnalyzing={isAnalyzing} chartData={trafficCountData} />
                <MovingAverageChart ref={movingAverageChartRef} isAnalyzing={isAnalyzing} />
                <VehicleComparisonChart ref={vehicleComparisonChartRef} isAnalyzing={isAnalyzing} />
                <CumulativeVolumeChart isAnalyzing={isAnalyzing} />
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <ControlStatus
                  isStartEnabled={!!activeVideo}
                  status={status}
                  onStatusChange={handleStatusChange}
                />
                <RealtimeDetectionStats isAnalyzing={isAnalyzing} />
                <AnomalyDetectionCard anomalies={anomalies} isAnalyzing={isAnalyzing} />
                <VehicleVolume
                  isAnalyzing={isAnalyzing}
                  coefficients={pcuCoefficients}
                />
                <PcuCoefficient
                  coefficients={pcuCoefficients}
                  onUpdate={setPcuCoefficients}
                />
                <ExportReport 
                  isAnalyzing={isAnalyzing} 
                  trafficData={trafficCountData} 
                  countingChartRef={trafficCountingChartRef}
                  movingAverageChartRef={movingAverageChartRef}
                  vehicleComparisonChartRef={vehicleComparisonChartRef}
                />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
