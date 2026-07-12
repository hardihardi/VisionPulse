'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

interface HlsVideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export function HlsVideoPlayer({ src, ...props }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    let hls: Hls | null = null;
    const isHls = src.toLowerCase().includes('.m3u8') || src.toLowerCase().includes('m3u8');

    const loadingTimeout = setTimeout(() => {
      if (isLoading && !error) {
        setError("Waktu pemuatan habis. Aliran mungkin sedang sibuk atau diblokir CORS.");
        setIsLoading(false);
      }
    }, 20000);

    const setupHls = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
          if (props.autoPlay) {
            video.play().catch(() => {
              video.muted = true;
              video.play().catch(e => console.error("Play failed", e));
            });
          }
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (data.details === 'manifestLoadError') {
                  setError("Gagal memuat manifest HLS (CORS/URL Issue)");
                  setIsLoading(false);
                  clearTimeout(loadingTimeout);
                } else {
                  hls?.startLoad();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                setError("Kesalahan fatal pada pemutar");
                setIsLoading(false);
                clearTimeout(loadingTimeout);
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
          if (props.autoPlay) video.play();
        });
      } else {
        setError("Browser tidak mendukung HLS");
        setIsLoading(false);
      }
    };

    if (isHls) {
      setupHls();
    } else {
      video.src = src;
      video.onloadeddata = () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      };
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (hls) hls.destroy();
    };
  }, [src, props.autoPlay, retryCount]);

  return (
    <div className="relative w-full h-full min-h-[220px] bg-black flex items-center justify-center overflow-hidden rounded-md">
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-white text-xs font-medium">Memuat CCTV Bekasi...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-4 text-center gap-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div className="space-y-1">
            <p className="text-white text-sm font-bold">{error}</p>
            <p className="text-muted-foreground text-[10px]">Periksa koneksi internet atau gunakan Mode LIVE.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setRetryCount(c => c + 1)} className="h-8 text-[10px]">
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </Button>
            <Button size="sm" variant="outline" asChild className="h-8 text-[10px]">
              <a href={src} target="_blank" rel="noopener">Buka Link</a>
            </Button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        {...props}
        playsInline
        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ objectFit: 'contain' }}
      />

      {!isLoading && !error && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-red-600 text-white border-none text-[8px] px-1 py-0 h-4">LIVE</Badge>
        </div>
      )}
    </div>
  );
}
