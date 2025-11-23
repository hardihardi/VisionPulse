
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video } from 'lucide-react';

type VideoHistoryItem = {
  file: File;
  src: string;
};

interface VideoHistoryCardProps {
  videoHistory: VideoHistoryItem[];
  onSelectVideo: (file: File) => void;
}

export function VideoHistoryCard({ videoHistory, onSelectVideo }: VideoHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Video Sesi Ini</CardTitle>
        <CardDescription>Pilih video untuk dianalisis kembali.</CardDescription>
      </CardHeader>
      <CardContent>
        {videoHistory.length > 0 ? (
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {videoHistory.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => onSelectVideo(item.file)}
                >
                  <Video className="mr-2 h-4 w-4" />
                  <span className="truncate">{item.file.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-24 text-muted-foreground text-center">
            <Video className="w-8 h-8 mb-2" />
            <span>Belum ada video yang diunggah di sesi ini.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
