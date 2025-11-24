
'use client';

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { VideoUploadForm } from '@/components/dashboard/video-upload-form';
import { VideoHistoryCard, VideoHistoryItem } from '@/components/traffic/video-history-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getEnhancedRecognition } from '@/app/(actions)/enhance-recognition';
import { DetectionResultCard } from '@/components/dashboard/detection-result-card';
import { EnhanceLicensePlateRecognitionOutput } from '@/ai/flows/enhance-license-plate-recognition';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HistoryPage() {
  const [currentVideo, setCurrentVideo] = useState<VideoHistoryItem | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoHistory, setVideoHistory] = useState<VideoHistoryItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<EnhanceLicensePlateRecognitionOutput | null>(null);
  const { toast } = useToast();
  const placeholder = PlaceHolderImages.find(img => img.id === 'traffic-feed-detected');


  useEffect(() => {
    if (currentVideo) {
      const url = URL.createObjectURL(currentVideo.file);
      setVideoSrc(url);
      setDetectionResult(null);

      // Clean up the previous object URL if it exists
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoSrc(null);
    }
  }, [currentVideo]);

  const handleVideoUpload = (name: string, file: File) => {
    const newVideoItem: VideoHistoryItem = { id: Date.now().toString(), name, file };
    if (!videoHistory.some(v => v.file.name === file.name && v.file.size === file.size)) {
      setVideoHistory(prev => [...prev, newVideoItem]);
    }
    setCurrentVideo(newVideoItem);
  };

  const handleSelectFromHistory = (video: VideoHistoryItem) => {
    setCurrentVideo(video);
  };
  
  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleAnalyzeVideo = async () => {
    if (!currentVideo) return;

    setIsAnalyzing(true);
    setDetectionResult(null);

    try {
      const videoDataUri = await toBase64(currentVideo.file);
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
                <Card>
                    <CardHeader>
                        <CardTitle>{currentVideo?.name || 'Pratinjau Video'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video overflow-hidden rounded-md relative bg-muted">
                        {videoSrc ? (
                            <video src={videoSrc} className="w-full h-full object-cover" controls autoPlay loop muted />
                        ) : placeholder && (
                            <Image 
                                src={placeholder.imageUrl} 
                                alt={placeholder.description} 
                                fill
                                className="object-cover"
                                data-ai-hint={placeholder.imageHint}
                            />
                        )}
                        </div>
                    </CardContent>
                </Card>
                <DetectionResultCard detectionResult={detectionResult} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-6">
                <VideoUploadForm onVideoUpload={handleVideoUpload} />
                <Card>
                    <CardHeader>
                        <CardTitle>Kontrol Analisis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleAnalyzeVideo} disabled={!currentVideo || isAnalyzing} className="w-full">
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
