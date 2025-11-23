
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileVideo, History } from 'lucide-react';

interface VideoHistoryCardProps {
  videoHistory: File[];
  onSelectFromHistory: (file: File) => void;
}

export function VideoHistoryCard({ videoHistory, onSelectFromHistory }: VideoHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Video Sesi Ini</CardTitle>
        <CardDescription>Pilih video untuk dianalisis kembali.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          {videoHistory.length > 0 ? (
            <div className="space-y-2">
              {videoHistory.map((video, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => onSelectFromHistory(video)}
                >
                  <FileVideo className="mr-2 h-4 w-4" />
                  <span className="truncate">{video.name}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
              <History className="w-8 h-8 mb-2" />
              <span>Belum ada riwayat video.</span>
              <span className="text-xs">Unggah video untuk memulai.</span>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
