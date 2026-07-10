"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Square } from 'lucide-react';
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

  const formatStartTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = () => {
    switch (status) {
        case 'STARTED': return 'SELESAI';
        case 'ANALYZING': return 'AKTIF';
        case 'STOPPED': return 'BERHENTI';
    }
  }

  const getStatusColor = () => {
    switch (status) {
        case 'STARTED': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'ANALYZING': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
        case 'STOPPED': return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  }

  const isProcessing = status === 'ANALYZING';

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base">Kontrol & Status</CardTitle>
        <CardDescription className="text-[10px] sm:text-xs text-muted-foreground/70">Kelola pemrosesan video.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <span className="text-muted-foreground font-medium uppercase tracking-wider">Mulai</span>
            <span className="font-mono">{formatStartTime(startTime)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <span className="text-muted-foreground font-medium uppercase tracking-wider">Status</span>
            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold \${getStatusColor()}`}>{getStatusText()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 h-9 sm:h-10 text-xs sm:text-sm font-bold"
            onClick={handleStartClick}
            disabled={!isStartEnabled || isProcessing || status === 'STARTED'}
          >
            {isProcessing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1.5 h-3.5 w-3.5" />}
            {isProcessing ? 'Proses...' : 'Mulai'}
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 h-9 sm:h-10 text-xs sm:text-sm font-bold"
            onClick={() => onStatusChange("STOPPED")}
            disabled={status === 'STOPPED'}
          >
            <Square className="mr-1.5 h-3.5 w-3.5 fill-current" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
