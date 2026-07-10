"use client"

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UniversalVideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  isAnalyzing?: boolean;
}

function getYouTubeEmbedUrl(url: string): string | null {
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
  } catch (e) {
    return null;
  }
  if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  return null;
}

export function UniversalVideoPlayer({
  src,
  className = "w-full h-full",
  autoPlay = true,
  muted = true,
  controls = true,
  loop = true,
  isAnalyzing = false
}: UniversalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isHls = src.includes('.m3u8');
  const youtubeUrl = getYouTubeEmbedUrl(src);

  useEffect(() => {
    if (youtubeUrl || !videoRef.current || !src) {
        setIsLoading(false);
        return;
    }

    let hls: Hls | null = null;
    setIsLoading(true);
    setError(null);

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (autoPlay) {
            videoRef.current?.play().catch(e => console.error("HLS Autoplay failed", e));
          }
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
             console.error("HLS Fatal Error:", data);
             switch (data.type) {
               case Hls.ErrorTypes.NETWORK_ERROR:
                 setError("Masalah jaringan saat memuat stream HLS (.m3u8).");
                 break;
               case Hls.ErrorTypes.MEDIA_ERROR:
                 setError("Masalah media saat memutar stream HLS.");
                 break;
               default:
                 setError("Gagal memuat stream HLS. Pastikan URL valid dan server mendukung CORS.");
                 break;
             }
             setIsLoading(false);
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoRef.current.src = src;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoPlay) videoRef.current?.play();
        });
      } else {
        setError("Browser Anda tidak mendukung pemutaran HLS.");
        setIsLoading(false);
      }
    } else {
      // Normal video file
      videoRef.current.src = src;
      videoRef.current.onloadeddata = () => setIsLoading(false);
      videoRef.current.onerror = () => {
        setError("Gagal memuat file video.");
        setIsLoading(false);
      };
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, isHls, youtubeUrl, autoPlay, isAnalyzing]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-md h-full min-h-[300px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan Video</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="mt-4 text-xs text-muted-foreground break-all text-center">{src}</p>
      </div>
    );
  }

  if (youtubeUrl && !isAnalyzing) {
    return (
      <div className="relative w-full h-full min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          src={youtubeUrl}
          title="YouTube Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={className}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] bg-black">
      {isLoading && !isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <video
        ref={videoRef}
        className={className}
        controls={controls}
        muted={muted}
        loop={loop}
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  );
}
