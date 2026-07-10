"use client"

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
  const [retryCount, setRetryCount] = useState(0);

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

    // Timeout for loading
    const loadTimeout = setTimeout(() => {
        if (isLoading) {
            setError("Waktu tunggu pemuatan stream habis. Ini mungkin masalah jaringan atau CORS.");
            setIsLoading(false);
        }
    }, 15000);

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferLength: 30,
            xhrSetup: (xhr) => {
              xhr.withCredentials = false;
            }
        });
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          clearTimeout(loadTimeout);
          setIsLoading(false);
          if (autoPlay) {
            videoRef.current?.play().catch(e => {
                console.error("HLS Autoplay failed", e);
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(pErr => console.error("Muted autoplay failed", pErr));
                }
            });
          }
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
             console.error("HLS Fatal Error:", data);
             clearTimeout(loadTimeout);
             switch (data.type) {
               case Hls.ErrorTypes.NETWORK_ERROR:
                 setError("Masalah jaringan (CORS atau Server Offline) saat memuat stream HLS (.m3u8).");
                 break;
               case Hls.ErrorTypes.MEDIA_ERROR:
                 setError("Masalah media saat memutar stream HLS.");
                 hls?.recoverMediaError();
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
          clearTimeout(loadTimeout);
          setIsLoading(false);
          if (autoPlay) videoRef.current?.play();
        });
        videoRef.current.onerror = () => {
            clearTimeout(loadTimeout);
            setError("Gagal memuat stream HLS secara native.");
            setIsLoading(false);
        };
      } else {
        clearTimeout(loadTimeout);
        setError("Browser Anda tidak mendukung pemutaran HLS.");
        setIsLoading(false);
      }
    } else {
      // Normal video file
      videoRef.current.src = src;
      videoRef.current.onloadeddata = () => {
          clearTimeout(loadTimeout);
          setIsLoading(false);
      };
      videoRef.current.onerror = () => {
        clearTimeout(loadTimeout);
        setError("Gagal memuat file video.");
        setIsLoading(false);
      };
    }

    return () => {
      clearTimeout(loadTimeout);
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, isHls, youtubeUrl, autoPlay, isAnalyzing, retryCount]);

  const handleRetry = () => {
      setRetryCount(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-md h-full min-h-[300px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Masalah Pemutaran</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-xs">{error}</p>
            <div className="flex flex-col gap-2">
                <p className="text-[9px] opacity-70 italic">
                    Catatan: Beberapa stream CCTV (e.g. Bekasi Kota) memblokir akses browser langsung (CORS).
                    Backend AI kami tetap dapat menganalisis stream ini di tab LIVE.
                </p>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleRetry} className="h-7 text-[10px] flex-1">
                        <RefreshCw className="w-3 h-3 mr-1" /> Coba Lagi
                    </Button>
                    <Button size="sm" variant="outline" asChild className="h-7 text-[10px] flex-1">
                        <a href={src} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" /> Buka Langsung
                        </a>
                    </Button>
                </div>
            </div>
          </AlertDescription>
        </Alert>
        <p className="mt-4 text-[9px] text-muted-foreground break-all text-center max-w-xs">{src}</p>
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
