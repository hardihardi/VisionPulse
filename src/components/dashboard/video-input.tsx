
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Play } from 'lucide-react';
import { useRef } from 'react';

interface VideoInputProps {
  onVideoSelect: (file: File) => void;
  videoSrc: string | null;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
}

export function VideoInput({ onVideoSelect, videoSrc, onStartAnalysis, isAnalyzing }: VideoInputProps) {
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
      <CardHeader>
        <CardTitle>Input Video</CardTitle>
        <CardDescription>Unggah video untuk dianalisis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleUploadClick} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Unggah
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleFileChange}
            />
            <Button size="sm" onClick={onStartAnalysis} className="w-full" disabled={!videoSrc || isAnalyzing}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                {isAnalyzing ? 'Menganalisis...' : 'Mulai Analisis'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
