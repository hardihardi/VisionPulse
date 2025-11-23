"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { EnhanceLicensePlateRecognitionOutput } from '@/ai/flows/enhance-license-plate-recognition';
import { CheckCircle, Zap } from 'lucide-react';

interface DetectionResultCardProps {
  detectionResult: EnhanceLicensePlateRecognitionOutput | null;
}

export function DetectionResultCard({ detectionResult }: DetectionResultCardProps) {
  if (!detectionResult) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hasil Deteksi</CardTitle>
                <CardDescription>Menunggu analisis video untuk deteksi plat nomor.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                    <Zap className="w-8 h-8 mb-2" />
                    <span>Belum ada hasil</span>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle>Hasil Deteksi Plat Nomor</CardTitle>
        <CardDescription>{detectionResult.enhancementResult}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-background rounded-lg border text-center">
            <CardDescription className="text-xs">Plat Nomor Terdeteksi:</CardDescription>
            <p className="text-3xl font-bold text-primary tracking-wider">{detectionResult.licensePlate}</p>
        </div>
        <div className="flex items-center justify-center text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span>Akurasi: <strong>{detectionResult.accuracyAchieved}</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}
