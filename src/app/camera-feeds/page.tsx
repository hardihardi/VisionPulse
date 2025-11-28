
'use client';

import { MainSidebar } from '@/components/layout/main-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { initialCameraData } from '@/lib/data';
import type { CameraData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

// Note: Metadata object di client component tidak akan berfungsi untuk SEO.
// Untuk SEO, pindahkan ini ke parent server component atau gunakan `generateMetadata`.
// Tapi untuk saat ini kita letakkan di sini untuk referensi.
export const metadata: Metadata = {
  title: 'Umpan Kamera Langsung',
  description: 'Pantau semua umpan kamera lalu lintas yang terhubung dalam satu galeri terpusat.',
};

function CameraFeedCard({ camera, isAnomaly }: { camera: CameraData; isAnomaly?: boolean; }) {
  // Menggunakan video placeholder. Idealnya, ini akan menjadi URL stream langsung.
  const videoUrl = "https://storage.googleapis.com/aifire.dev-dependencies.appspot.com/templates/vision-pulse-traffic-video-720.mp4";

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg", isAnomaly && "border-destructive/50 ring-2 ring-destructive/20")}>
      <CardHeader className="p-4">
        <CardTitle className="text-base">{camera.location}</CardTitle>
        <CardDescription className="text-xs">{camera.id}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video relative">
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline // Atribut penting untuk autoplay di browser mobile
          />
          {isAnomaly && (
            <div className="absolute top-2 right-2 flex items-center gap-2 text-xs bg-destructive text-destructive-foreground py-1 px-2 rounded-full">
              <Zap className="w-3 h-3" />
              <span>Anomali</span>
            </div>
          )}
           <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white font-bold text-lg">{camera.vehicles} <span className="text-sm font-normal">kendaraan</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function CameraFeedsPage() {
  // Simulasikan anomali untuk beberapa kamera
  const anomalyCameraIds = ['CAM-002', 'CAM-005'];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <DashboardHeader
              title="Umpan Kamera Langsung"
              description="Pantau semua umpan kamera lalu lintas secara terpusat."
            />
            <main className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {initialCameraData.map((camera) => (
                <CameraFeedCard 
                  key={camera.id} 
                  camera={camera} 
                  isAnomaly={anomalyCameraIds.includes(camera.id)}
                />
              ))}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
