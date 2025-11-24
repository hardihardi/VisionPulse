
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, Thermometer, ShieldCheck, Car } from 'lucide-react';

interface RealtimeDetectionStatsProps {
  isAnalyzing: boolean;
}

const StatDisplay = ({ title, value, unit, icon: Icon }: { title: string, value: string, unit: string, icon: React.ElementType }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 bg-muted rounded-md">
      <Icon className="w-5 h-5 text-muted-foreground" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-bold">
        {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  </div>
);

export function RealtimeDetectionStats({ isAnalyzing }: RealtimeDetectionStatsProps) {
  const [stats, setStats] = useState({
    platesDetected: 0,
    detectionRate: 80,
    averageSpeed: 45.2,
    trafficDensity: 'Rendah',
    vehiclesPerPeriod: 0,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAnalyzing) {
      interval = setInterval(() => {
        setStats(prevStats => {
          const newPlates = prevStats.platesDetected + Math.floor(Math.random() * 3);
          const newVehicles = Math.floor(newPlates / (Math.random() * 5 + 2));
          let density = 'Rendah';
          if (newVehicles > 15) density = 'Tinggi';
          else if (newVehicles > 5) density = 'Sedang';

          return {
            platesDetected: newPlates,
            detectionRate: Math.min(99, Math.max(75, prevStats.detectionRate + (Math.random() - 0.5) * 2)),
            averageSpeed: Math.max(20, prevStats.averageSpeed + (Math.random() - 0.5) * 1.5),
            trafficDensity: density,
            vehiclesPerPeriod: newVehicles,
          };
        });
      }, 2000);
    } else {
      setStats({
        platesDetected: 0,
        detectionRate: 80,
        averageSpeed: 45.2,
        trafficDensity: 'Rendah',
        vehiclesPerPeriod: 0,
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Deteksi Real-Time</CardTitle>
        <CardDescription>Metrik yang diperbarui secara langsung dari analisis video.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <StatDisplay 
          title="Plat Nomor Terdeteksi" 
          value={stats.platesDetected.toString()}
          unit="plat" 
          icon={Car}
        />
        <StatDisplay 
          title="Tingkat Deteksi" 
          value={`~${stats.detectionRate.toFixed(0)}`}
          unit="%" 
          icon={ShieldCheck}
        />
        <StatDisplay 
          title="Kecepatan Rata-rata" 
          value={stats.averageSpeed.toFixed(1)}
          unit="km/h" 
          icon={Gauge}
        />
        <StatDisplay 
          title="Kepadatan Lalu Lintas" 
          value={stats.trafficDensity}
          unit={`${stats.vehiclesPerPeriod} kend./periode`}
          icon={Thermometer}
        />
      </CardContent>
    </Card>
  );
}
