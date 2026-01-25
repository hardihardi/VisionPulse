
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { initialCameraData, updateCameraData } from '@/lib/data';
import type { CameraData } from '@/lib/types';
import { Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CameraStatusCard() {
  const [cameras, setCameras] = useState<CameraData[]>(initialCameraData.slice(0, 4)); // Tampilkan 4 kamera saja

  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prevCameras => prevCameras.map(updateCameraData));
    }, 2500); // Update every 2.5 seconds for a more dynamic feel

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Status Kamera</CardTitle>
          <CardDescription>Kendaraan terdeteksi per lokasi.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cameras.map((camera, index) => (
            <div key={camera.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", camera.vehicles > 0 ? "bg-green-500/20" : "bg-muted")}>
                        <Video className={cn("h-4 w-4", camera.vehicles > 0 ? "text-green-500" : "text-muted-foreground")} />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{camera.location}</p>
                        <p className="text-xs text-muted-foreground">{camera.id}</p>
                    </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{camera.vehicles}</p>
                  <p className="text-xs text-muted-foreground">kendaraan</p>
                </div>
              </div>
              {index < cameras.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
