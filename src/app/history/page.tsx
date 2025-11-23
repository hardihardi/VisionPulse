
'use client';

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { VideoInput } from '@/components/dashboard/video-input';
import { VideoHistoryCard } from '@/components/traffic/video-history-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Film, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getEnhancedRecognition } from '@/app/(actions)/enhance-recognition';
import { DetectionResultCard } from '@/components/dashboard/detection-result-card';
import { EnhanceLicensePlateRecognitionOutput } from '@/ai/flows/enhance-license-plate-recognition';

export default function HistoryPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoHistory, setVideoHistory] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<EnhanceLicensePlateRecognitionOutput | null>(null);
  const { toast } = useToast();

  const handleVideoSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setDetectionResult(null); 
    if (!videoHistory.some(v => v.name === file.name && v.size === file.size)) {
      setVideoHistory(prev => [...prev, file]);
    }
  };

  const handleSelectFromHistory = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setDetectionResult(null);
  };
  
  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleAnalyzeVideo = async () => {
    if (!videoFile) return;

    setIsAnalyzing(true);
    setDetectionResult(null);

    try {
      const videoDataUri = await toBase64(videoFile);
      const { result, error } = await getEnhancedRecognition({ videoDataUri });

      if (error) {
          toast({
              title: "Deteksi Gagal",
              description: error,
              variant: "destructive",
          });
      } else if (result) {
          toast({
              title: "Deteksi Berhasil",
              description: `Plat nomor terdeteksi: ${result.licensePlate}`,
          });
          setDetectionResult(result);
      }
    } catch (error) {
       toast({
            title: "Gagal Memproses Video",
            description: "Terjadi kesalahan saat membaca file video.",
            variant: "destructive",
        });
    } finally {
        setIsAnalyzing(false);
    }
  };
  
  useEffect(() => {
    // Clean up object URLs to prevent memory leaks
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <DashboardHeader 
              title="Riwayat Penyimpanan Video" 
              description="Kelola dan analisis kembali video yang telah diunggah." 
            />
            <main className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <VideoInput onVideoSelect={handleVideoSelect} videoSrc={videoSrc} />
                <DetectionResultCard detectionResult={detectionResult} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Kontrol Analisis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleAnalyzeVideo} disabled={!videoFile || isAnalyzing} className="w-full">
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menganalisis...
                                </>
                            ) : "Mulai Analisis Video"}
                        </Button>
                    </CardContent>
                </Card>
                <VideoHistoryCard 
                  videoHistory={videoHistory}
                  onSelectFromHistory={handleSelectFromHistory}
                />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
