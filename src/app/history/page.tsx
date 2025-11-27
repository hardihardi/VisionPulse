
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { VideoUploadForm, VideoUploadFormHandles } from '@/components/dashboard/video-upload-form';
import { VideoHistoryCard } from '@/components/traffic/video-history-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getEnhancedRecognition } from '@/app/(actions)/enhance-recognition';
import { DetectionResultCard } from '@/components/dashboard/detection-result-card';
import { EnhanceLicensePlateRecognitionOutput } from '@/ai/flows/enhance-license-plate-recognition';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useVideoHistory, VideoHistoryItem } from '@/hooks/use-video-history';


function getYouTubeEmbedUrl(url: string): string | null {
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch(e) {
        // Not a valid URL, but might be a raw embed link
        return null;
    }
    
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    return null;
}


export default function HistoryPage() {
  const { currentVideo, videoSrc, setCurrentVideo, loadVideo, toBase64 } = useVideoHistory();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<EnhanceLicensePlateRecognitionOutput | null>(null);
  const { toast } = useToast();
  const placeholder = PlaceHolderImages.find(img => img.id === 'traffic-feed-detected');
  const uploadFormRef = useRef<VideoUploadFormHandles>(null);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  useEffect(() => {
    if (currentVideo) {
      setDetectionResult(null);
    }
  }, [currentVideo])


  const handleVideoUpload = (videoItem: VideoHistoryItem) => {
    setCurrentVideo(videoItem);
    toast({
        title: "Video Aktif Diperbarui",
        description: `"${videoItem.name}" telah dijadikan video aktif.`,
    });
  };

  const handleDeleteCurrentVideo = () => {
    setCurrentVideo(null);
    toast({
      title: "Video Aktif Dihapus",
      description: "Video telah dihapus dari sesi ini.",
    });
  };
  
  const handleAddNew = () => {
    uploadFormRef.current?.focusNameInput();
  };

  const handleAnalyzeVideo = async () => {
    if (!currentVideo) {
       toast({
        title: "Analisis Gagal",
        description: "Tidak ada video yang aktif.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentVideo.source.type === 'url') {
      toast({
        title: "Fitur Belum Didukung",
        description: "Analisis video dari URL belum didukung. Silakan unggah file video.",
        variant: "default",
      });
      return;
    }

    if (!currentVideo.source.file) {
       toast({
        title: "Analisis Gagal",
        description: "File video tidak ditemukan.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setDetectionResult(null);

    try {
      const videoDataUri = await toBase64(currentVideo.source.file);
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
    } catch (error: any) {
       toast({
            title: "Gagal Memproses Video",
            description: error.message || "Terjadi kesalahan saat membaca file video.",
            variant: "destructive",
        });
    } finally {
        setIsAnalyzing(false);
    }
  };
  
  const renderVideoPlayer = () => {
    if (!videoSrc) {
        return placeholder && (
            <Image 
                src={placeholder.imageUrl} 
                alt={placeholder.description} 
                fill
                className="object-cover"
                data-ai-hint={placeholder.imageHint}
            />
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

    // Fallback to standard video player for blob URLs or direct video links
    return <video src={videoSrc} className="w-full h-full object-cover" controls autoPlay loop muted />;
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
                           {renderVideoPlayer()}
                        </div>
                    </CardContent>
                </Card>
                <DetectionResultCard detectionResult={detectionResult} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-6">
                <VideoUploadForm ref={uploadFormRef} onVideoSelect={handleVideoUpload} />
                <Card>
                    <CardHeader>
                        <CardTitle>Kontrol Analisis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleAnalyzeVideo} disabled={!currentVideo || isAnalyzing || currentVideo.source.type === 'url'} className="w-full">
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
                  currentVideo={currentVideo}
                  onDeleteCurrentVideo={handleDeleteCurrentVideo}
                  onAddNew={handleAddNew}
                />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
