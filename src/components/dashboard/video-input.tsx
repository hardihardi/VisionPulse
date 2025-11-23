"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function VideoInput() {
  const placeholder = PlaceHolderImages.find(img => img.id === 'traffic-feed-detected');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Lalu Lintas</CardTitle>
      </CardHeader>
      <CardContent>
        {placeholder && (
          <div className="aspect-video overflow-hidden rounded-md relative">
            <Image 
              src={placeholder.imageUrl} 
              alt={placeholder.description} 
              fill
              className="object-cover"
              data-ai-hint={placeholder.imageHint}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
