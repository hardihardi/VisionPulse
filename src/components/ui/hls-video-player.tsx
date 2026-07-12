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

    // Timeout mechanism: if loading takes too long
    const loadingTimeout = setTimeout(() => {
      if (isLoading && !error) {
        setError("Waktu pemuatan habis. Stream mungkin tidak dapat diakses atau diblokir oleh kebijakan CORS browser.");
        setIsLoading(false);
      }
    }, 20000);

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            manifestLoadingTimeOut: 20000,
            manifestLoadingMaxRetry: 10,
            levelLoadingTimeOut: 20000,
            levelLoadingMaxRetry: 10,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 10,
            startLevel: 0,
            xhrSetup: (xhr, url) => {
                xhr.withCredentials = false;
            }
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS Manifest Parsed:", src);
          clearTimeout(loadingTimeout);
          setIsLoading(false);
          if (props.autoPlay) {
            video.play().catch(e => {
                console.warn("Auto-play blocked, retrying muted:", e);
                video.muted = true;
                video.play().catch(p => console.error("Muted auto-play also failed:", p));
            });
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS Event Error:", data);
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.log("Fatal network error encountered, trying to recover...");
                        hls?.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log("Fatal media error encountered, trying to recover...");
                        hls?.recoverMediaError();
                        break;
                    default:
                        clearTimeout(loadingTimeout);
                        setError("Terjadi kesalahan fatal pada pemutar video HLS.");
                        setIsLoading(false);
                        hls?.destroy();
                        break;
                }
            } else if (data.details === 'manifestLoadError' && data.response?.code === 0) {
                // Often CORS
                clearTimeout(loadingTimeout);
                setIsLoading(false);
                setError("Akses stream diblokir oleh kebijakan CORS browser. Pastikan server Bekasi mengizinkan akses dari domain ini.");
            }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support (Safari / iOS)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
          if (props.autoPlay) video.play();
        });
        video.addEventListener('error', () => {
           clearTimeout(loadingTimeout);
           setError("Browser gagal memuat stream HLS secara asli.");
           setIsLoading(false);
        });
      } else {
        clearTimeout(loadingTimeout);
        setError("Browser Anda tidak mendukung pemutaran HLS.");
        setIsLoading(false);
      }
    } else {
      // Standard video file
      video.src = src;
      video.onloadeddata = () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      };
      video.onerror = () => {
        clearTimeout(loadingTimeout);
        setError("Gagal memuat file video.");
        setIsLoading(false);
      };
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, props.autoPlay, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full group bg-black overflow-hidden flex items-center justify-center rounded-md border border-white/5">
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 gap-5">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div className="text-center">
            <span className="text-white text-sm font-semibold block">Menghubungkan HLS...</span>
            <span className="text-muted-foreground text-[10px] mt-1 block">FTL Fitness Bekasi</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30 p-8 text-center gap-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <div className="space-y-2">
            <p className="text-white text-sm font-bold leading-tight">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="default" size="sm" onClick={handleRetry} className="h-9 text-xs gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Coba Lagi
              </Button>
              <Button variant="outline" size="sm" asChild className="h-9 text-xs gap-2">
                <a href={src} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Langsung
                </a>
              </Button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        {...props}
        playsInline
        crossOrigin="anonymous"
        className={`w-full h-full object-contain transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'} ${props.className || ''}`}
      />

      {!isLoading && !error && (
          <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-black/50 text-white border-none text-[9px] font-bold">LIVE HLS</Badge>
          </div>
      )}
    </div>
  );
}
