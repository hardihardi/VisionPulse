'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Car, Bike, Truck, Bus, Clock, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeDetectionStatsProps {
  isAnalyzing: boolean;
  backendStats: any;
}

export function RealtimeDetectionStats({ isAnalyzing, backendStats }: RealtimeDetectionStatsProps) {
  if (!isAnalyzing || !backendStats) {
    return (
      <Card>
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Statistik Real-time
          </CardTitle>
          <CardDescription className="text-xs">Menunggu data analisis...</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
           <div className="h-40 flex flex-col items-center justify-center text-xs text-muted-foreground/60 italic border-2 border-dashed rounded-lg">
              <LayoutDashboard className="w-6 h-6 mb-2 opacity-30" />
              Aktifkan sistem untuk melihat deteksi.
           </div>
        </CardContent>
      </Card>
    );
  }

  const { counts, total_skr, moving_average_skr, uptime } = backendStats;

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
      case 'trailer': return 'Trailer';
      default: return type;
    }
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            Statistik Real-time
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-mono font-normal">
            <Clock className="w-3 h-3 mr-1" />
            {formatUptime(uptime || 0)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 p-2.5 rounded-lg border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
            <p className="text-sm font-bold text-green-500 leading-tight mt-0.5">MENGANALISIS</p>
          </div>
          <div className="bg-muted/50 p-2.5 rounded-lg border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Kendaraan</p>
            <p className="text-sm font-bold leading-tight mt-0.5">{backendStats.total_count || 0}</p>
          </div>
          <div className="bg-muted/50 p-2.5 rounded-lg border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total SKR</p>
            <p className="text-sm font-bold leading-tight mt-0.5">{total_skr?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-muted/50 p-2.5 rounded-lg border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Waktu Proses</p>
            <p className="text-sm font-bold leading-tight mt-0.5">{formatUptime(uptime || 0)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(counts || {}).map(([direction, vehicles]: [string, any]) => (
            <div key={direction} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className={cn("text-[11px] font-bold uppercase tracking-wider", getDirectionColor(direction))}>
                  {direction === 'Mendekat' ? '⬇ MENDUKUNG' : '⬆ MENJAUH'}
                </p>
                <Badge variant="secondary" className="text-[9px] h-4">SKR: {moving_average_skr?.[direction]?.toFixed(2) || '0.00'}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {Object.entries(vehicles).map(([type, count]: [string, any]) => (
                  count > 0 && (
                    <div key={type} className="flex items-center justify-between text-xs bg-muted/30 p-1.5 rounded border border-border/20">
                      <div className="flex items-center gap-2">
                        {getVehicleIcon(type)}
                        <span className="font-medium">{getTranslatedType(type)}</span>
                      </div>
                      <span className="font-bold">{count}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
