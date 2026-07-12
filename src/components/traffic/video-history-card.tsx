"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileVideo, Trash, FolderPlus, Download, History } from 'lucide-react';
import type { VideoHistoryItem } from '@/hooks/use-video-history';
import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';

interface VideoHistoryCardProps {
  currentVideo: VideoHistoryItem | null;
  onDeleteCurrentVideo: () => void;
  onAddNew: () => void;
}

export function VideoHistoryCard({ currentVideo, onDeleteCurrentVideo, onAddNew }: VideoHistoryCardProps) {
  const [recordings, setRecordings] = useState<any[]>([]);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const fetchRecordings = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/recordings`);
      if (resp.ok) {
        const data = await resp.json();
        setRecordings(data.recordings);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchRecordings();
    const interval = setInterval(fetchRecordings, 10000);
    return () => clearInterval(interval);
  }, [BACKEND_URL]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="px-4 sm:px-6 pb-3 flex flex-row items-center justify-between">
          <div>
              <CardTitle className="text-base font-semibold">Penyimpanan Sesi Video</CardTitle>
              <CardDescription>Video yang aktif untuk dianalisis.</CardDescription>
          </div>
          <Button size="icon" variant="ghost" onClick={onAddNew} aria-label="Tambah video baru">
              <FolderPlus className="h-5 w-5" />
              <span className="sr-only">Tambah video baru</span>
          </Button>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="min-h-16">
            {currentVideo ? (
              <div className="flex items-center group p-2 rounded-md hover:bg-muted">
                <div
                  className="w-full justify-start text-left flex-grow truncate flex items-center"
                >
                  <FileVideo className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="truncate font-medium">{currentVideo.name}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 ml-1"
                  onClick={onDeleteCurrentVideo}
                  aria-label="Hapus video saat ini"
                >
                  <Trash className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Hapus video</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center py-4">
                <span className="text-sm">Belum ada video aktif.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">Hasil Rekaman Analisis</CardTitle>
          </div>
          <CardDescription className="text-[10px]">Arsip video hasil proses AI backend.</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {recordings.length > 0 ? (
              recordings.map((rec) => (
                <div key={rec.filename} className="flex items-center justify-between p-2 rounded-md hover:bg-muted border border-transparent hover:border-border transition-colors">
                  <div className="flex flex-col gap-0.5 truncate pr-2">
                    <span className="text-[11px] font-medium truncate">{rec.filename}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground">{(rec.size / (1024 * 1024)).toFixed(1)} MB</span>
                      <span className="text-[9px] text-muted-foreground">{new Date(rec.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                    <a href={`${BACKEND_URL}/recordings/${rec.filename}`} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-[10px]">
                Belum ada rekaman tersimpan.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
