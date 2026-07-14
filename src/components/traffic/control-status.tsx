
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type SystemStatus = "STOPPED" | "STARTED" | "ANALYZING";

interface ControlStatusProps {
    isStartEnabled: boolean;
    status: SystemStatus;
    onStatusChange: (status: SystemStatus) => void;
}

export function ControlStatus({ isStartEnabled, status, onStatusChange }: ControlStatusProps) {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (status === "STARTED" || status === "ANALYZING") {
      if (!startTime) {
        setStartTime(new Date());
      }
    } else if (status === "STOPPED") {
      setStartTime(null);
    }
  }, [status, startTime]);

  const handleStartClick = () => {
    if (!isStartEnabled) {
      toast({
        title: 'Analisis Belum Siap',
        description: 'Pastikan ada video aktif sebelum memulai analisis. Anda bisa mengunggahnya di halaman Riwayat.',
        variant: 'destructive',
      });
      return;
    }
    onStatusChange("STARTED");
  };

  const getStatusText = () => {
    switch (status) {
        case 'STARTED': return 'SELESAI';
        case 'ANALYZING': return 'MENGANALISIS...';
        case 'STOPPED': return 'DIHENTIKAN';
    }
  }

  const getStatusColor = () => {
    switch (status) {
        case 'STARTED': return 'text-green-500';
        case 'ANALYZING': return 'text-yellow-500';
        case 'STOPPED': return 'text-red-500';
    }
  }

  const isProcessing = status === 'ANALYZING';

  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          Kontrol & Status Sistem
        </CardTitle>
        <CardDescription className="text-xs">Mulai atau hentikan analisis video aktif.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-xs border rounded-lg p-3 bg-background/50">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Status</span>
            <span className={`font-bold ${getStatusColor()}`}>{getStatusText()}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Mulai</span>
            <span className="font-mono text-foreground font-medium block truncate">
              {startTime ? startTime.toLocaleTimeString('id-ID') : '-'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium" 
            onClick={handleStartClick}
            disabled={!isStartEnabled || isProcessing || status === 'STARTED'}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isProcessing ? 'Menganalisis...' : 'Mulai Analisis Video'}
          </Button>
          <Button 
            variant="destructive" 
            className="w-full font-medium" 
            onClick={() => onStatusChange("STOPPED")}
            disabled={status === 'STOPPED'}
          >
            Hentikan & Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
