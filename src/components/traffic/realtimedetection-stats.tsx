'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Car, Bike, Truck, Bus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeDetectionStatsProps {
  isAnalyzing: boolean;
  backendStats: any;
}

export function RealtimeDetectionStats({ isAnalyzing, backendStats }: RealtimeDetectionStatsProps) {
  if (!isAnalyzing || !backendStats) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Statistik Real-time
          </CardTitle>
          <CardDescription>Menunggu data analisis...</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="h-32 flex items-center justify-center text-xs text-muted-foreground italic">
              Aktifkan sistem untuk melihat deteksi.
           </div>
        </CardContent>
      </Card>
    );
  }

  const { counts, total_skr, moving_average_skr } = backendStats;

  const getDirectionColor = (direction: string) =>
    direction === 'Mendekat' ? 'text-blue-500' : 'text-orange-500';

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'car': return <Car className="w-3.5 h-3.5" />;
      case 'motorcycle': return <Bike className="w-3.5 h-3.5" />;
      case 'truck': return <Truck className="w-3.5 h-3.5" />;
      case 'bus': return <Bus className="w-3.5 h-3.5" />;
      default: return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const getTranslatedType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'car': return 'Mobil';
      case 'motorcycle': return 'Motor';
      case 'truck': return 'Truk';
      case 'bus': return 'Bus';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
           <CardTitle className="text-sm font-semibold">Deteksi Kendaraan</CardTitle>
           <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-600 border-green-200">LIVE</Badge>
        </div>
        <CardDescription className="text-[10px]">Data akumulasi sesi ini.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(counts).map(([direction, vehicles]: [string, any]) => (
          <div key={direction} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {direction === 'Mendekat' ? <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> : <TrendingDown className="w-3.5 h-3.5 text-orange-500" />}
                <span className={cn("text-[11px] font-bold uppercase tracking-wider", getDirectionColor(direction))}>
                  {direction}
                </span>
              </div>
              <span className="text-[11px] font-semibold bg-muted px-1.5 py-0.5 rounded">
                SKR: {total_skr[direction].toFixed(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(vehicles).map(([type, count]: [string, any]) => (
                <div key={type} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-muted">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded-md bg-white shadow-sm border", getDirectionColor(direction))}>
                      {getVehicleIcon(type)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{getTranslatedType(type)}</span>
                  </div>
                  <span className="text-xs font-bold">{count}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[9px] bg-muted/50 p-1.5 rounded border border-dashed">
                <span className="text-muted-foreground">Tren (SKR/Jam):</span>
                <span className="font-bold flex items-center gap-1">
                   {moving_average_skr[direction].toFixed(0)}
                   <TrendingUp className="w-2.5 h-2.5" />
                </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
