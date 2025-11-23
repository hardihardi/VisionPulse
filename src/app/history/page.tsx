
'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { VideoInput } from '@/components/traffic/video-input';
import { VideoHistoryCard } from '@/components/traffic/video-history-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Film } from 'lucide-react';

export default function HistoryPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoHistory, setVideoHistory] = useState<File[]>([]);

  const handleVideoSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    if (!videoHistory.find(v => v.name === file.name)) {
      setVideoHistory(prev => [...prev, file]);
    }
  };

  const handleSelectFromHistory = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
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
                <VideoInput onVideoSelect={handleVideoSelect} videoSrc={videoSrc} />
                <Card>
                  <CardHeader>
                    <CardTitle>Analisis Video</CardTitle>
                    <CardDescription>Hasil analisis dari video yang dipilih akan muncul di sini.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-md">
                      <Film className="w-12 h-12 mb-2" />
                      <span>Belum ada hasil analisis.</span>
                      <span className="text-xs">Pilih video dan mulai analisis.</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1 flex flex-col gap-6">
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
