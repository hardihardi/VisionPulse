
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, Car, Bike, Bus, Truck, Box } from 'lucide-react';

interface DetectionLog {
  id: number;
  type: string;
  direction: string;
  time: string;
}

interface TrafficLogProps {
  logs: DetectionLog[];
  isAnalyzing: boolean;
}

const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'car': return <Car className="w-3 h-3" />;
        case 'motorcycle': return <Bike className="w-3 h-3" />;
        case 'bus': return <Bus className="w-3 h-3" />;
        case 'truck': return <Truck className="w-3 h-3" />;
        default: return <Box className="w-3 h-3" />;
    }
}

export function TrafficLog({ logs, isAnalyzing }: TrafficLogProps) {
  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Log Deteksi Langsung
          </CardTitle>
          {isAnalyzing && (
             <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>
        <CardDescription className="text-xs">
          Kendaraan terbaru yang melintasi garis.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4 pt-0">
          <div className="space-y-2">
            {!isAnalyzing && logs.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-10 italic">Mulai analisis untuk melihat log.</p>
            )}
            {logs.length === 0 && isAnalyzing && (
                <p className="text-center text-xs text-muted-foreground py-10 animate-pulse">Menunggu deteksi kendaraan...</p>
            )}
            {logs.slice().reverse().map((log, index) => (
              <div key={`${log.id}-${index}`} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50 text-[10px] sm:text-xs hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                    {getVehicleIcon(log.type)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">ID: {log.id}</span>
                    <span className="capitalize text-muted-foreground">{log.type}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={log.direction === 'Mendekat' ? 'default' : 'secondary'} className="text-[9px] px-1 py-0 h-4">
                    {log.direction}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground font-mono">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
