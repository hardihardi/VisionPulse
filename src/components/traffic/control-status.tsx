'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Square, Loader2, Video, VideoOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export type SystemStatus = 'STOPPED' | 'ANALYZING' | 'STARTED';

interface ControlStatusProps {
  isStartEnabled: boolean;
  status: SystemStatus;
  onStatusChange: (status: SystemStatus) => void;
}

export function ControlStatus({ isStartEnabled, status, onStatusChange }: ControlStatusProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUpdatingRecording, setIsUpdatingRecording] = useState(false);
  const { toast } = useToast();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    if (status === 'STARTED' || status === 'ANALYZING') {
      const checkRecording = async () => {
        try {
          const resp = await fetch(`${BACKEND_URL}/traffic-stats`);
          if (resp.ok) {
            const data = await resp.json();
            setIsRecording(data.recording);
          }
        } catch (e) {}
      };
      checkRecording();
    }
  }, [status, BACKEND_URL]);

  const toggleRecording = async () => {
    setIsUpdatingRecording(true);
    const endpoint = isRecording ? '/recording/stop' : '/recording/start';
    try {
      const resp = await fetch(`${BACKEND_URL}${endpoint}`, { method: 'POST' });
      if (resp.ok) {
        setIsRecording(!isRecording);
        toast({
          title: isRecording ? 'Perekaman Berhenti' : 'Perekaman Dimulai',
          description: isRecording
            ? 'Video hasil analisis akan disimpan di folder recordings.'
            : 'Video hasil analisis sedang diproses dan disimpan.',
        });
      }
    } catch (e) {
      toast({ title: 'Gagal mengubah status rekaman', variant: 'destructive' });
    } finally {
      setIsUpdatingRecording(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Kontrol Sistem</CardTitle>
          <Badge variant={status === 'STARTED' ? 'default' : status === 'ANALYZING' ? 'secondary' : 'outline'}>
            {status}
          </Badge>
        </div>
        <CardDescription>Mulai atau hentikan analisis AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {status === 'STOPPED' ? (
            <Button
              className="w-full"
              disabled={!isStartEnabled}
              onClick={() => onStatusChange('STARTED')}
            >
              <Play className="mr-2 h-4 w-4" /> Mulai
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => onStatusChange('STOPPED')}
            >
              <Square className="mr-2 h-4 w-4" /> Berhenti
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full"
            disabled={status === 'STOPPED' || isUpdatingRecording}
            onClick={toggleRecording}
          >
            {isUpdatingRecording ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
              <><VideoOff className="mr-2 h-4 w-4 text-destructive" /> Stop Rekam</>
            ) : (
              <><Video className="mr-2 h-4 w-4 text-primary" /> Rekam</>
            )}
          </Button>
        </div>

        {status === 'ANALYZING' && (
          <div className="flex items-center justify-center text-xs text-muted-foreground animate-pulse mt-2">
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Menghubungkan ke aliran video...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
