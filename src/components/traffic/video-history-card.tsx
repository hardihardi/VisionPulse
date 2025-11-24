
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileVideo, History, Trash, FolderPlus } from 'lucide-react';

export interface VideoHistoryItem {
  id: string;
  name: string;
  file: File;
}

interface VideoHistoryCardProps {
  videoHistory: VideoHistoryItem[];
  onSelectFromHistory: (file: VideoHistoryItem) => void;
  onDeleteFromHistory: (id: string) => void;
  onAddNew: () => void;
}

export function VideoHistoryCard({ videoHistory, onSelectFromHistory, onDeleteFromHistory, onAddNew }: VideoHistoryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Riwayat Video Sesi Ini</CardTitle>
            <CardDescription>Pilih video untuk dianalisis kembali.</CardDescription>
        </div>
        <Button size="icon" variant="ghost" onClick={onAddNew}>
            <FolderPlus className="h-5 w-5" />
            <span className="sr-only">Tambah video baru</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          {videoHistory.length > 0 ? (
            <div className="space-y-1">
              {videoHistory.map((video) => (
                <div key={video.id} className="flex items-center group">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left flex-grow truncate"
                    onClick={() => onSelectFromHistory(video)}
                  >
                    <FileVideo className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{video.name}</span>
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 ml-1 opacity-0 group-hover:opacity-100"
                    onClick={() => onDeleteFromHistory(video.id)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Hapus video</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
              <History className="w-8 h-8 mb-2" />
              <span>Belum ada riwayat video.</span>
              <span className="text-xs">Gunakan form di atas untuk memulai.</span>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
