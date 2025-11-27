
'use client';

import { MainSidebar } from '@/components/layout/main-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { initialCameraData } from '@/lib/data';
import type { CameraData } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function CameraFeedCard({ camera, isAnomaly, imageIndex }: { camera: CameraData; isAnomaly?: boolean; imageIndex: number }) {
  const placeholder = PlaceHolderImages[imageIndex % PlaceHolderImages.length];

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg", isAnomaly && "border-destructive/50 ring-2 ring-destructive/20")}>
      <CardHeader className="p-4">
        <CardTitle className="text-base">{camera.location}</CardTitle>
        <CardDescription className="text-xs">{camera.id}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video relative">
          {placeholder && (
            <Image
              src={placeholder.imageUrl}
              alt={`Umpan dari ${camera.location}`}
              fill
              className="object-cover"
              data-ai-hint={placeholder.imageHint}
            />
          )}
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
              {initialCameraData.map((camera, index) => (
                <CameraFeedCard 
                  key={camera.id} 
                  camera={camera} 
                  isAnomaly={anomalyCameraIds.includes(camera.id)}
                  imageIndex={index}
                />
              ))}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
