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
import { AlertCircle, LayoutDashboard, BarChart3, Settings, ListTodo, Activity, MonitorPlay, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { VideoHistoryCard } from './video-history-card';
import { HlsVideoPlayer } from '../ui/hls-video-player';
import { cn } from '@/lib/utils';


function getHlsEmbedUrl(url: string): string | null {
  if (url.includes('.m3u8')) {
    return `https://www.hlsplayer.net/embed?type=m3u8&src=${encodeURIComponent(url)}`;
  }
  return null;
}

const initialCoefficients: PcuCoefficients = {
  sepedaMotor: 0.25,
  mobil: 1.0,
  bus: 1.5,
  truk: 2.0,
  trailer: 2.5,
};

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
  const { activeVideo, videoSrc, deleteVideo, toBase64 } = useVideoHistory();
  const [status, setStatus] = useState<SystemStatus>('STOPPED');
  const [mode, setMode] = useState<'LIVE' | 'SIMULATION'>('LIVE');
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
            const resp = await fetch(`${BACKEND_URL}/health`);
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
    let simulationInterval: NodeJS.Timeout | undefined;

    if (isAnalyzing) {
        setAnomalies([]);
        setBackendError(false);

        if (mode === 'LIVE') {
            backendInterval = setInterval(async () => {
                try {
                    const response = await fetch(`${BACKEND_URL}/traffic-stats`);
                    if (!response.ok) throw new Error("Backend error");
                    const data = await response.json();

                    if (!data || !data.counts) return;

                    setBackendStats(data);
                    setBackendError(false);

                    const now = new Date();
                    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                    const entry = {
                        name: timeStr,
                        'Mobil (M)': data.counts.Mendekat?.car || 0,
                        'Bus (M)': data.counts.Mendekat?.bus || 0,
                        'Truk (M)': data.counts.Mendekat?.truck || 0,
                        'Sepeda Motor (M)': data.counts.Mendekat?.motorcycle || 0,
                        'Trailer (M)': data.counts.Mendekat?.trailer || 0,
                        'Mobil (J)': data.counts.Menjauh?.car || 0,
                        'Bus (J)': data.counts.Menjauh?.bus || 0,
                        'Truk (J)': data.counts.Menjauh?.truck || 0,
                        'Sepeda Motor (J)': data.counts.Menjauh?.motorcycle || 0,
                        'Trailer (J)': data.counts.Menjauh?.trailer || 0,
                        'Total Mendekat': Object.values(data.counts.Mendekat || {}).reduce((a: any, b: any) => a + b, 0),
                        'Total Menjauh': Object.values(data.counts.Menjauh || {}).reduce((a: any, b: any) => a + b, 0),
                    };

                    setTrafficCountData(prev => [...prev.slice(-9), entry]);
                } catch (error) {
                    setBackendError(true);
                    toast({ title: "Koneksi Backend Terputus", description: "Beralih ke tampilan simulasi.", variant: "destructive" });
                    setMode('SIMULATION');
                }
            }, 2000);
        } else {
            // SIMULATION MODE
            let simCounts = { Mendekat: { car: 10, bus: 2, truck: 1, motorcycle: 20 }, Menjauh: { car: 12, bus: 1, truck: 0, motorcycle: 18 } };

            simulationInterval = setInterval(() => {
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                // Random increments
                if (Math.random() > 0.5) simCounts.Mendekat.car += 1;
                if (Math.random() > 0.8) simCounts.Mendekat.motorcycle += 2;

                const mockStats = {
                    counts: simCounts,
                    total_count: Object.values(simCounts.Mendekat).reduce((a, b) => a + b, 0) + Object.values(simCounts.Menjauh).reduce((a, b) => a + b, 0),
                    total_skr: 45.5,
                    moving_average_skr: { Mendekat: 12.5, Menjauh: 14.2 },
                    uptime: 3600,
                    recent_logs: [],
                    config: { line_y: 0.5 }
                };

                setBackendStats(mockStats);

                const entry = {
                    name: timeStr,
                    'Mobil (M)': simCounts.Mendekat.car,
                    'Bus (M)': simCounts.Mendekat.bus,
                    'Truk (M)': simCounts.Mendekat.truck,
                    'Sepeda Motor (M)': simCounts.Mendekat.motorcycle,
                    'Trailer (M)': 0,
                    'Mobil (J)': simCounts.Menjauh.car,
                    'Bus (J)': simCounts.Menjauh.bus,
                    'Truk (J)': simCounts.Menjauh.truck,
                    'Sepeda Motor (J)': simCounts.Menjauh.motorcycle,
                    'Trailer (J)': 0,
                    'Total Mendekat': Object.values(simCounts.Mendekat).reduce((a, b) => a + b, 0),
                    'Total Menjauh': Object.values(simCounts.Menjauh).reduce((a, b) => a + b, 0),
                };
                setTrafficCountData(prev => [...prev.slice(-9), entry]);
            }, 2000);
        }

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
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [isAnalyzing, activeVideo, mode, BACKEND_URL, toast]);

  const handleLineYChange = async (val: number) => {
    if (mode === 'SIMULATION') {
        toast({ title: 'ROI Simulasi', description: `Mode simulasi tidak mendukung update fisik backend.` });
        return;
    }
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

      if (mode === 'LIVE') {
          if (activeVideo.source.type === 'url') {
              setStatus('ANALYZING');
              try {
                  await fetch(`${BACKEND_URL}/start-url`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: activeVideo.source.url })
                  });
              } catch (e) {
                  setBackendError(true);
                  setMode('SIMULATION');
              }
            return;
          }

          if (activeVideo.source.type === 'file' && activeVideo.source.file) {
            setStatus('ANALYZING');
            try {
              const formData = new FormData();
              formData.append('file', activeVideo.source.file);
              fetch(`${BACKEND_URL}/upload-video`, { method: 'POST', body: formData });
              const videoUri = await toBase64(activeVideo.source.file);
              setAnalysisInputUri(videoUri);
              const { result } = await getEnhancedRecognition({ videoDataUri: videoUri });
              if (result) setDetectionResult(result);
              setStatus('STARTED');
            } catch (e) {
               console.error("Error uploading/analyzing file", e);
            }
          }
      } else {
          setStatus('STARTED');
          toast({ title: "Mode Simulasi Aktif", description: "Menjalankan analisis menggunakan data simulasi." });
      }
    } else {
      setStatus('STOPPED');
      if (mode === 'LIVE') fetch(`${BACKEND_URL}/stop`, { method: 'POST' }).catch(() => {});
    }
  };

  const renderVideoPlayer = () => {
    if (!activeVideo) return (
        <div className="flex flex-col items-center justify-center h-full bg-muted/20 text-muted-foreground gap-4 border-2 border-dashed rounded-lg m-4">
            <MonitorPlay className="w-12 h-12 opacity-20" />
            <div className="text-center">
                <p className="font-medium">Belum ada video dipilih</p>
                <p className="text-xs opacity-60">Pilih sumber dari Penyimpanan Sesi untuk memulai.</p>
            </div>
        </div>
    );

    if (mode === 'SIMULATION') {
        return (
            <div className="relative w-full h-full">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] text-white p-6 text-center">
                    <Zap className="w-12 h-12 text-blue-400 mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold mb-2">MODE SIMULASI</h3>
                    <p className="text-sm opacity-80 max-w-md">Kamera fisik dinonaktifkan. Anda melihat data riset simulasi untuk analisis tren strategis.</p>
                    <Button variant="default" size="sm" onClick={() => setMode('LIVE')} className="mt-6">Gunakan Mode LIVE</Button>
                </div>
                <img src="https://images.unsplash.com/photo-1545147418-4f1e62640ef7?q=80&w=2000&auto=format&fit=crop" alt="Traffic Simulation" className="w-full h-full object-cover grayscale opacity-50" />
            </div>
        )
    }

    if (activeVideo.source.type === 'url') {
      const hlsEmbed = getHlsEmbedUrl(activeVideo.source.url);
      if (hlsEmbed) {
        return (
            <div className="w-full h-full flex flex-col bg-black">
                <div className="flex-grow relative">
                    <HlsVideoPlayer src={activeVideo.source.url} autoPlay muted className="w-full h-full" />
                </div>
            </div>
        );
      }
    }

    if (videoSrc) {
        return <video src={videoSrc} controls autoPlay muted className="w-full h-full object-cover" />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-black/10">
            <RefreshCw className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Menghubungkan ke aliran video...</p>
        </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans selection:bg-primary/10">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DashboardHeader title="VisionPulse Traffic AI" description={isAnalyzing ? "Menganalisis aliran video m3u8 dari Bekasi Kota secara real-time." : "Hubungkan kamera atau pilih video untuk memulai analisis lalu lintas cerdas."} />
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2 bg-muted px-3 py-1.5 rounded-full border">
                        <Zap className={cn("w-3.5 h-3.5", mode === 'SIMULATION' ? 'text-blue-500' : 'text-muted-foreground')} />
                        <Label htmlFor="mode-switch" className="text-xs font-medium cursor-pointer">Simulasi</Label>
                        <Switch
                            id="mode-switch"
                            checked={mode === 'SIMULATION'}
                            onCheckedChange={(checked) => setMode(checked ? 'SIMULATION' : 'LIVE')}
                        />
                    </div>
                    <Badge variant={isBackendHealthy ? "outline" : "destructive"} className="h-8 gap-1.5 font-medium px-3">
                        {isBackendHealthy ? <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {isBackendHealthy ? "Backend Aktif" : "Backend Offline"}
                    </Badge>
                </div>
            </div>

            {backendError && mode === 'LIVE' && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 border-l-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Masalah Koneksi Server</AlertTitle>
                    <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                        <span>Server backend AI di <code>{BACKEND_URL}</code> tidak merespons.</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="xs" onClick={() => window.location.reload()}>Coba Lagi</Button>
                            <Button variant="secondary" size="xs" onClick={() => setMode('SIMULATION')}>Aktifkan Simulasi</Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {mode === 'SIMULATION' && (
                <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400">
                    <MonitorPlay className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Mode Simulasi Aktif</AlertTitle>
                    <AlertDescription>
                        Anda sedang melihat data simulasi riset. Fitur deteksi real-time dari kamera fisik dinonaktifkan.
                    </AlertDescription>
                </Alert>
            )}

            <main>
              {/* Desktop View: Grid Layout */}
              <div className="hidden xl:grid gap-6 grid-cols-12">
                <div className="col-span-9 space-y-6">
                    <Card className="overflow-hidden border-none shadow-md">
                        <CardHeader className="bg-primary/10 py-3 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                {activeVideo?.name || 'Monitor Lalu Lintas'}
                            </CardTitle>
                            {mode === 'SIMULATION' && <Badge variant="secondary" className="text-[10px] uppercase">Riset Simulasi</Badge>}
                        </CardHeader>
                        <CardContent className="p-0 bg-black">
                    {isAnalyzing && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                            <Badge className="bg-red-500 hover:bg-red-600 animate-pulse border-none text-[10px] px-1.5 h-5">LIVE</Badge>
                            <span className="text-white text-[10px] font-medium drop-shadow-md bg-black/20 px-2 rounded-full backdrop-blur-sm">CCTV BEKASI KOTA</span>
                        </div>
                    )}
                            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg border border-white/5 aspect-[5/2] w-full">{renderVideoPlayer()}</div>
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
                    <VideoHistoryCard currentVideo={activeVideo} onDeleteCurrentVideo={() => deleteVideo(activeVideo?.id || "")} onAddNew={() => {}} />
                    <TrafficLog logs={backendStats?.recent_logs || []} isAnalyzing={isAnalyzing} />
                    <ExportReport isAnalyzing={isAnalyzing} trafficData={trafficCountData} countingChartRef={trafficCountingChartRef} movingAverageChartRef={movingAverageChartRef} vehicleComparisonChartRef={vehicleComparisonChartRef} />
                    <PcuCoefficient coefficients={pcuCoefficients} onUpdate={setPcuCoefficients} lineY={backendStats?.config?.line_y} onLineYChange={handleLineYChange} />
                    <AnomalyDetectionCard anomalies={anomalies} isAnalyzing={isAnalyzing} />
                </div>
              </div>

              {/* Mobile/Tablet View: Tabs Layout */}
              <div className="xl:hidden space-y-6">
                <div className="relative bg-black rounded-lg overflow-hidden shadow-md aspect-video sm:aspect-[5/2] w-full">
                    {isAnalyzing && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                            <Badge className="bg-red-500 hover:bg-red-600 animate-pulse border-none text-[10px] px-1.5 h-5">LIVE</Badge>
                            <span className="text-white text-[10px] font-medium drop-shadow-md bg-black/20 px-2 rounded-full backdrop-blur-sm">CCTV BEKASI KOTA</span>
                        </div>
                    )}
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
                        <VideoHistoryCard currentVideo={activeVideo} onDeleteCurrentVideo={() => deleteVideo(activeVideo?.id || "")} onAddNew={() => {}} />
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
                        <Card>
                            <CardHeader className="px-4 sm:px-6 pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" /> Konfigurasi Endpoint
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">API Server:</span>
                                    <code className="bg-muted px-1.5 py-0.5 rounded">{BACKEND_URL}</code>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">Health Check:</span>
                                    <Badge variant={isBackendHealthy ? "secondary" : "destructive"} className="h-4 text-[9px]">
                                        {isBackendHealthy ? "ONLINE" : "OFFLINE"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
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
