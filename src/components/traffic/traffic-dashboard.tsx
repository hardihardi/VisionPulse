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
import { AiTrafficAnalysisCard } from './ai-traffic-analysis-card';
import { TrafficLog } from './traffic-log';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, LayoutDashboard, BarChart3, Settings, ListTodo, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '../ui/badge';

const initialCoefficients: PcuCoefficients = {
  sepedaMotor: 0.25,
  mobil: 1.0,
  bus: 1.5,
  truk: 2.0,
  trailer: 2.5,
};

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
  if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  return null;
}

const saveDetection = async (detection: Omit<Detection, 'id' | 'timestamp'>) => {
  if (!firestore) return;
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
  const [analysisInputUri, setAnalysisInputUri] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [pcuCoefficients, setPcuCoefficients] =
    useState<PcuCoefficients>(initialCoefficients);
  const [trafficCountData, setTrafficCountData] = useState<any[]>([]);
  const [backendStats, setBackendStats] = useState<any>(null);
  const [backendError, setBackendError] = useState<boolean>(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  const placeholder = PlaceHolderImages.find(
    (img) => img.id === 'traffic-feed-detected'
  );
  const trafficCountingChartRef = useRef<HTMLDivElement>(null);
  const movingAverageChartRef = useRef<HTMLDivElement>(null);
  const vehicleComparisonChartRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const isAnalyzing = status === 'ANALYZING' || status === 'STARTED';
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  // Health Check
  useEffect(() => {
    const checkHealth = async () => {
        try {
            const resp = await fetch(`${BACKEND_URL}/traffic-stats`);
            setIsBackendHealthy(resp.ok);
        } catch (e) {
            setIsBackendHealthy(false);
        }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [BACKEND_URL]);

  useEffect(() => {
    if (activeVideo) {
      handleStatusChange('STARTED');
    } else {
      handleStatusChange('STOPPED');
    }
  }, [activeVideo]);

  useEffect(() => {
    if (detectionResult && activeVideo) {
      saveDetection({
        plate: detectionResult.licensePlate,
        videoName: activeVideo.name,
        videoId: activeVideo.id,
      });
    }
  }, [detectionResult, activeVideo]);


  useEffect(() => {
    let backendInterval: NodeJS.Timeout | undefined;
    let anomalyInterval: NodeJS.Timeout | undefined;

    if (isAnalyzing) {
        setAnomalies([]);
        setBackendError(false);

        backendInterval = setInterval(async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/traffic-stats`);
                if (!response.ok) throw new Error("Backend error");
                const data = await response.json();
                setBackendStats(data.stats);
                setBackendError(false);

                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                const entry = {
                    name: timeStr,
                    'Mobil (M)': data.stats.counts.Mendekat.car || 0,
                    'Bus (M)': data.stats.counts.Mendekat.bus || 0,
                    'Truk (M)': data.stats.counts.Mendekat.truck || 0,
                    'Sepeda Motor (M)': data.stats.counts.Mendekat.motorcycle || 0,
                    'Trailer (M)': 0,
                    'Mobil (J)': data.stats.counts.Menjauh.car || 0,
                    'Bus (J)': data.stats.counts.Menjauh.bus || 0,
                    'Truk (J)': data.stats.counts.Menjauh.truck || 0,
                    'Sepeda Motor (J)': data.stats.counts.Menjauh.motorcycle || 0,
                    'Trailer (J)': 0,
                    'Total Mendekat': Object.values(data.stats.counts.Mendekat).reduce((a: any, b: any) => a + b, 0),
                    'Total Menjauh': Object.values(data.stats.counts.Menjauh).reduce((a: any, b: any) => a + b, 0),
                };

                setTrafficCountData(prev => [...prev.slice(-9), entry]);
            } catch (error) {
                setBackendError(true);
            }
        }, 2000);
        
        anomalyInterval = setInterval(() => {
          if (Math.random() < 0.1) {
            const newAnomaly = generateAnomaly(activeVideo?.name);
            setAnomalies(prev => [newAnomaly, ...prev].slice(0, 5));
          }
        }, 15000);
    } else {
        setTrafficCountData([]);
        setAnomalies([]);
        setBackendStats(null);
    }

    return () => {
      if (backendInterval) clearInterval(backendInterval);
      if (anomalyInterval) clearInterval(anomalyInterval);
    };
  }, [isAnalyzing, activeVideo]);

  const handleLineYChange = async (val: number) => {
    try {
        await fetch(`${BACKEND_URL}/update-config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line_y: val })
        });
        toast({ title: 'ROI Diperbarui', description: `Posisi garis hitung: ${val.toFixed(2)}` });
    } catch (e) {
        toast({ title: 'Gagal Update ROI', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (newStatus: SystemStatus) => {
    if (newStatus === 'STARTED') {
      if (!activeVideo) return;
      setDetectionResult(null);
      setAnalysisInputUri(null);

      if (activeVideo.source.type === 'url') {
          setStatus('ANALYZING');
          try {
              await fetch(`${BACKEND_URL}/process-url`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: activeVideo.source.url })
              });
          } catch (e) {
              setBackendError(true);
          }
        return;
      }

      if (activeVideo.source.type === 'file' && activeVideo.source.file) {
        setStatus('ANALYZING');
        try {
          const formData = new FormData();
          formData.append('video', activeVideo.source.file);
          fetch(`${BACKEND_URL}/upload-video`, { method: 'POST', body: formData });
          const videoUri = await toBase64(activeVideo.source.file);
          setAnalysisInputUri(videoUri);
          const { result } = await getEnhancedRecognition({ videoDataUri: videoUri });
          if (result) setDetectionResult(result);
          setStatus('STARTED');
        } catch (error: any) {
          setStatus('STOPPED');
        }
      }
    } else if (newStatus === 'STOPPED') {
      setStatus('STOPPED');
      setDetectionResult(null);
      setAnalysisInputUri(null);
      fetch(`${BACKEND_URL}/stop`, { method: 'POST' }).catch(() => {});
    }
  };

  const renderVideoPlayer = () => {
    if (!videoSrc) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted relative min-h-[300px]">
                {placeholder && <Image src={placeholder.imageUrl} alt="Placeholder" fill className="object-cover opacity-20" />}
                <p className="text-muted-foreground relative z-10">Pilih video di Riwayat.</p>
            </div>
        );
    }

    if (isAnalyzing) {
        return (
            <div className="w-full h-full relative bg-black min-h-[300px]">
                <img
                    src={`${BACKEND_URL}/stream?t=${new Date().getTime()}`}
                    className="w-full h-full object-contain"
                    alt="Stream"
                    onError={() => setBackendError(true)}
                />
                {backendError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Re-connect</Button>
                    </div>
                )}
            </div>
        );
    }

    const embedUrl = getYouTubeEmbedUrl(videoSrc);
    if (embedUrl) return <iframe src={embedUrl} title="YouTube" frameBorder="0" allowFullScreen className="w-full h-full min-h-[300px]" />;
    return <video src={videoSrc} className="w-full h-full object-cover min-h-[300px]" controls autoPlay loop muted />;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DashboardHeader title="VisionPulse Traffic AI" description="Analisis lalu lintas cerdas berbasis visi komputer." />
                <div className="flex items-center gap-2">
                    <Badge variant={isBackendHealthy ? "outline" : "destructive"} className="h-6 gap-1.5 font-medium px-2.5">
                        {isBackendHealthy ? <Activity className="w-3 h-3 text-green-500 animate-pulse" /> : <AlertCircle className="w-3 h-3" />}
                        {isBackendHealthy ? "Backend Aktif" : "Backend Offline"}
                    </Badge>
                </div>
            </div>

            {backendError && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Masalah Koneksi</AlertTitle>
                    <AlertDescription>Server backend tidak merespons. Jalankan server Flask untuk mengaktifkan fitur AI.</AlertDescription>
                </Alert>
            )}

            <main>
              {/* Desktop View: Grid Layout */}
              <div className="hidden xl:grid gap-6 grid-cols-12">
                <div className="col-span-9 space-y-6">
                    <Card className="overflow-hidden border-none shadow-md">
                        <CardHeader className="bg-primary/10 py-3 border-b">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                {activeVideo?.name || 'Monitor Lalu Lintas'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="aspect-video relative bg-black">{renderVideoPlayer()}</div>
                        </CardContent>
                    </Card>
                    <div className="grid grid-cols-2 gap-6">
                        <TrafficCountingChart ref={trafficCountingChartRef} isAnalyzing={isAnalyzing} chartData={trafficCountData} />
                        <MovingAverageChart ref={movingAverageChartRef} isAnalyzing={isAnalyzing} backendStats={backendStats} />
                    </div>
                    <VehicleComparisonChart ref={vehicleComparisonChartRef} isAnalyzing={isAnalyzing} backendStats={backendStats} />
                    <CumulativeVolumeChart isAnalyzing={isAnalyzing} backendStats={backendStats} />
                </div>
                <div className="col-span-3 space-y-6">
                    <ControlStatus isStartEnabled={!!activeVideo} status={status} onStatusChange={handleStatusChange} />
                    <RealtimeDetectionStats isAnalyzing={isAnalyzing} backendStats={backendStats} />
                    <TrafficLog logs={backendStats?.recent_logs || []} isAnalyzing={isAnalyzing} />
                    <ExportReport isAnalyzing={isAnalyzing} trafficData={trafficCountData} countingChartRef={trafficCountingChartRef} movingAverageChartRef={movingAverageChartRef} vehicleComparisonChartRef={vehicleComparisonChartRef} />
                    <PcuCoefficient coefficients={pcuCoefficients} onUpdate={setPcuCoefficients} lineY={backendStats?.config?.line_y} onLineYChange={handleLineYChange} />
                    <AnomalyDetectionCard anomalies={anomalies} isAnalyzing={isAnalyzing} />
                </div>
              </div>

              {/* Mobile/Tablet View: Tabs Layout */}
              <div className="xl:hidden space-y-6">
                <div className="aspect-video relative bg-black rounded-lg overflow-hidden shadow-md">
                    {renderVideoPlayer()}
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-4 w-full h-12">
                        <TabsTrigger value="overview" className="flex flex-col gap-1 text-[10px] sm:text-xs">
                            <LayoutDashboard className="w-4 h-4" /> Ikhtisar
                        </TabsTrigger>
                        <TabsTrigger value="charts" className="flex flex-col gap-1 text-[10px] sm:text-xs">
                            <BarChart3 className="w-4 h-4" /> Grafik
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="flex flex-col gap-1 text-[10px] sm:text-xs">
                            <ListTodo className="w-4 h-4" /> Log
                        </TabsTrigger>
                        <TabsTrigger value="config" className="flex flex-col gap-1 text-[10px] sm:text-xs">
                            <Settings className="w-4 h-4" /> Pengaturan
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 pt-4">
                        <ControlStatus isStartEnabled={!!activeVideo} status={status} onStatusChange={handleStatusChange} />
                        <RealtimeDetectionStats isAnalyzing={isAnalyzing} backendStats={backendStats} />
                        <VehicleVolume isAnalyzing={isAnalyzing} coefficients={pcuCoefficients} backendStats={backendStats} />
                        <AnomalyDetectionCard anomalies={anomalies} isAnalyzing={isAnalyzing} />
                    </TabsContent>

                    <TabsContent value="charts" className="space-y-4 pt-4">
                        <TrafficCountingChart ref={trafficCountingChartRef} isAnalyzing={isAnalyzing} chartData={trafficCountData} />
                        <MovingAverageChart ref={movingAverageChartRef} isAnalyzing={isAnalyzing} backendStats={backendStats} />
                        <VehicleComparisonChart ref={vehicleComparisonChartRef} isAnalyzing={isAnalyzing} backendStats={backendStats} />
                        <CumulativeVolumeChart isAnalyzing={isAnalyzing} backendStats={backendStats} />
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-4 pt-4">
                        <TrafficLog logs={backendStats?.recent_logs || []} isAnalyzing={isAnalyzing} />
                        <DetectionResultCard detectionResult={detectionResult} />
                        <AiTrafficAnalysisCard isAnalyzing={isAnalyzing} analysisInputUri={analysisInputUri} sourceType={activeVideo?.source.type ?? null} />
                    </TabsContent>

                    <TabsContent value="config" className="space-y-4 pt-4">
                        <PcuCoefficient coefficients={pcuCoefficients} onUpdate={setPcuCoefficients} lineY={backendStats?.config?.line_y} onLineYChange={handleLineYChange} />
                        <ExportReport isAnalyzing={isAnalyzing} trafficData={trafficCountData} countingChartRef={trafficCountingChartRef} movingAverageChartRef={movingAverageChartRef} vehicleComparisonChartRef={vehicleComparisonChartRef} />
                    </TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
