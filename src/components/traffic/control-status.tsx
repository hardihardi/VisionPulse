
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export type SystemStatus = "STOPPED" | "STARTED" | "ANALYZING";

interface ControlStatusProps {
    isStartEnabled: boolean;
    status: SystemStatus;
    onStatusChange: (status: SystemStatus) => void;
}

export function ControlStatus({ isStartEnabled, status, onStatusChange }: ControlStatusProps) {
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (status === "STARTED" || status === "ANALYZING") {
      if (!startTime) {
        setStartTime(new Date());
      }
    } else if (status === "STOPPED") {
      setStartTime(null);
    }
  }, [status, startTime]);

  const formatStartTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusText = () => {
    switch (status) {
        case 'STARTED': return 'ANALYSIS COMPLETE';
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
    <Card>
      <CardHeader>
        <CardTitle>Kontrol & Status Sistem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p>Waktu Mulai: {formatStartTime(startTime)}</p>
          <p>STATUS: <span className={getStatusColor()}>{getStatusText()}</span></p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => onStatusChange("STARTED")}
            disabled={!isStartEnabled || isProcessing || status === 'STARTED'}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isProcessing ? 'Menganalisis...' : 'Mulai Analisis Video'}
          </Button>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => onStatusChange("STOPPED")}
            disabled={isProcessing}
          >
            Hentikan & Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
