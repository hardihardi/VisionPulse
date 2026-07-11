"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileVideo, Trash, FolderPlus, ChevronRight } from 'lucide-react';
import type { VideoHistoryItem } from '@/hooks/use-video-history';
import Link from 'next/link';

interface VideoHistoryCardProps {
  currentVideo: VideoHistoryItem | null;
  onDeleteCurrentVideo: () => void;
  onAddNew: () => void;
}

export function VideoHistoryCard({ currentVideo, onDeleteCurrentVideo, onAddNew }: VideoHistoryCardProps) {
  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Penyimpanan Sesi Video</CardTitle>
            <CardDescription className="text-[10px]">Video aktif untuk analisis.</CardDescription>
        </div>
        <Button size="icon" variant="ghost" onClick={onAddNew} className="h-8 w-8" title="Tambah video baru">
            <FolderPlus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="min-h-[60px] flex flex-col justify-center">
          {currentVideo ? (
            <div className="flex items-center group p-2 rounded-lg bg-accent/30 border border-border/50">
              <Link
                href="/video-storage"
                className="flex-grow min-w-0 flex items-center gap-2 group/link"
              >
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0 group-hover/link:bg-primary/20 transition-colors">
                  <FileVideo className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold truncate group-hover/link:text-primary transition-colors">{currentVideo.name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">{currentVideo.source.type === 'url' ? 'URL Stream' : 'File Lokal'}</p>
                </div>
                <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                    e.preventDefault();
                    onDeleteCurrentVideo();
                }}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
                variant="outline"
                className="w-full border-dashed py-8 h-auto flex flex-col gap-2 bg-accent/10 hover:bg-accent/20"
                onClick={onAddNew}
            >
              <FolderPlus className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs font-medium">Belum ada video aktif</p>
                <p className="text-[10px] text-muted-foreground">Klik untuk menambahkan</p>
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
