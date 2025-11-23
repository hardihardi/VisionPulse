"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useRef } from 'react';

interface VideoInputProps {
  onVideoSelect: (file: File) => void;
  videoSrc: string | null;
}

export function VideoInput({ onVideoSelect, videoSrc }: VideoInputProps) {
  const placeholder = PlaceHolderImages.find(img => img.id === 'traffic-feed-detected');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Video Lalu Lintas</CardTitle>
        <Button size="sm" variant="outline" onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Unggah Video
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="video/*"
          onChange={handleFileChange}
        />
      </CardHeader>
      <CardContent>
        <div className="aspect-video overflow-hidden rounded-md relative bg-muted">
          {videoSrc ? (
            <video src={videoSrc} className="w-full h-full object-cover" controls autoPlay loop muted />
          ) : placeholder && (
            <Image 
              src={placeholder.imageUrl} 
              alt={placeholder.description} 
              fill
              className="object-cover"
              data-ai-hint={placeholder.imageHint}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
