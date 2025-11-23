"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ControlStatusProps {
    isStartEnabled: boolean;
}

export function ControlStatus({ isStartEnabled }: ControlStatusProps) {
  const [status, setStatus] = useState("STOPPED");
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "STARTED") {
      setStartTime(new Date());
    } else {
      setStartTime(null);
    }
    return () => clearTimeout(timer);
  }, [status]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontrol & Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p>Waktu Mulai: {formatStartTime(startTime)}</p>
          <p>STATUS: <span className={status === 'STARTED' ? 'text-green-500' : 'text-red-500'}>{status}</span></p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => setStatus("STARTED")}
            disabled={!isStartEnabled}
          >
            START Pencatatan Data
          </Button>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => setStatus("STOPPED")}
          >
            STOP Pencatatan Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
