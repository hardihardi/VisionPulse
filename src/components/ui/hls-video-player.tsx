'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';

interface HlsVideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export function HlsVideoPlayer({ src, ...props }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    let hls: Hls | null = null;

    const isHls = src.toLowerCase().includes('.m3u8') || src.toLowerCase().includes('m3u8');

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            xhrSetup: (xhr) => {
                // Ensure credentials or other settings if needed
                // xhr.withCredentials = true;
            }
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (props.autoPlay) {
            video.play().catch(e => {
                console.error("Auto-play blocked or failed:", e);
                // Many browsers block auto-play without user interaction or mute
                video.muted = true;
                video.play().catch(p => console.error("Muted auto-play also failed"));
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error("HLS Network Error:", data);
                        if (data.details === 'manifestLoadError') {
                            setError("Gagal memuat manifest HLS (CORS atau URL tidak valid)");
                            setIsLoading(false);
                        } else {
                            hls?.startLoad();
                        }
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error("HLS Media Error:", data);
                        hls?.recoverMediaError();
                        break;
                    default:
                        console.error("Fatal HLS Error:", data);
                        setError("Terjadi kesalahan fatal pada pemutar video");
                        setIsLoading(false);
                        hls?.destroy();
                        break;
                }
            }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support (Safari)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (props.autoPlay) video.play();
        });
        video.addEventListener('error', () => {
           setError("Browser gagal memuat stream HLS secara asli");
           setIsLoading(false);
        });
      } else {
        setError("Browser Anda tidak mendukung pemutaran HLS");
        setIsLoading(false);
      }
    } else {
      // Standard video file
      video.src = src;
      video.onloadeddata = () => setIsLoading(false);
      video.onerror = () => {
        setError("Gagal memuat file video");
        setIsLoading(false);
      };
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, props.autoPlay]);

  return (
    <div className="relative w-full h-full group bg-black overflow-hidden flex items-center justify-center">
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-white text-xs font-medium">Memuat Aliran Video...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-6 text-center gap-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <div className="space-y-1">
            <p className="text-white text-sm font-semibold">{error}</p>
            <p className="text-muted-foreground text-[10px]">Coba segarkan halaman atau pastikan koneksi internet aktif.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-8 text-xs">
            Segarkan
          </Button>
        </div>
      )}

      <video
        ref={videoRef}
        {...props}
        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${props.className || ''}`}
      />
    </div>
  );
}
