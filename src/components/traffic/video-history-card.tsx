
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileVideo, Trash, FolderPlus } from 'lucide-react';

export interface VideoHistoryItem {
  id: string;
  name: string;
  file: File;
}

interface VideoHistoryCardProps {
  currentVideo: VideoHistoryItem | null;
  onDeleteCurrentVideo: () => void;
  onAddNew: () => void;
}

export function VideoHistoryCard({ currentVideo, onDeleteCurrentVideo, onAddNew }: VideoHistoryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Penyimpanan Sesi Video</CardTitle>
            <CardDescription>Video yang aktif untuk dianalisis.</CardDescription>
        </div>
        <Button size="icon" variant="ghost" onClick={onAddNew} aria-label="Tambah video baru">
            <FolderPlus className="h-5 w-5" />
            <span className="sr-only">Tambah video baru</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-24">
          {currentVideo ? (
            <div className="flex items-center group p-2 rounded-md hover:bg-muted">
              <div
                className="w-full justify-start text-left flex-grow truncate flex items-center"
              >
                <FileVideo className="mr-2 h-4 w-4 flex-shrink-0" />
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
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
              <span>Belum ada video aktif.</span>
              <span className="text-xs">Gunakan form di atas untuk memulai.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
