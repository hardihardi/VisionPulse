"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

export function VideoInput() {
  const { toast } = useToast();
  const placeholder = PlaceHolderImages.find(img => img.id === 'traffic-feed');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = formData.get('video_url');

    if (url) {
      toast({
        title: "Processing Started",
        description: `Analyzing video stream from: ${url}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a video stream URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Feed Source</CardTitle>
      </CardHeader>
      <CardContent>
        {placeholder && (
          <div className="aspect-video overflow-hidden rounded-md mb-4 relative">
            <Image 
              src={placeholder.imageUrl} 
              alt={placeholder.description} 
              fill
              className="object-cover"
              data-ai-hint={placeholder.imageHint}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-white/70" />
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input name="video_url" type="url" placeholder="Enter video stream URL..." />
          <Button type="submit" className="w-full">
            Start Analysis
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
