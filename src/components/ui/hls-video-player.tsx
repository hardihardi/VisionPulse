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
    }, 15000); // Reduced to 15 seconds for faster feedback

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            levelLoadingTimeOut: 10000,
            fragLoadingTimeOut: 15000,
            startLevel: 0,
            xhrSetup: (xhr) => {
                xhr.withCredentials = false;
            }
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS Manifest Parsed");
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
                clearTimeout(loadingTimeout);
                setIsLoading(false);
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        if (data.details === 'manifestLoadError' || data.details === 'levelLoadError' || data.details === 'manifestParsingError') {
                            setError("Gagal memuat atau mengurai manifest HLS. Ini biasanya disebabkan oleh kebijakan CORS atau stream yang offline.");
                        } else {
                            console.log("Attempting to recover from fatal network error...");
                            hls?.startLoad();
                        }
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log("Attempting to recover from fatal media error...");
                        hls?.recoverMediaError();
                        break;
                    default:
                        setError("Terjadi kesalahan fatal pada pemutar video HLS.");
                        hls?.destroy();
                        break;
                }
            } else if (data.details === 'manifestLoadError' && data.response?.code === 0) {
                // Code 0 often means CORS block
                clearTimeout(loadingTimeout);
                setIsLoading(false);
                setError("Akses stream diblokir oleh kebijakan CORS browser. Gunakan Mode LIVE untuk streaming melalui backend.");
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
           setError("Browser gagal memuat stream HLS secara asli. Pastikan URL dapat diakses.");
           setIsLoading(false);
        });
      } else {
        clearTimeout(loadingTimeout);
        setError("Browser Anda tidak mendukung pemutaran HLS (m3u8).");
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
    <div className="relative w-full h-full group bg-black overflow-hidden flex items-center justify-center rounded-md border border-white/5 shadow-inner">
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 gap-5 animate-in fade-in duration-300">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <span className="text-white text-sm font-semibold block">Menghubungkan ke Aliran HLS...</span>
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Menyiapkan Penyangga Video</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30 p-8 text-center gap-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-3">
            <p className="text-white text-sm font-bold leading-tight px-4">{error}</p>
            <p className="text-muted-foreground text-[11px] max-w-[280px] mx-auto leading-relaxed">
                Stream Bekasi Kota seringkali membatasi akses langsung dari browser.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[300px]">
              <Button variant="default" size="sm" onClick={handleRetry} className="flex-1 h-9 text-xs gap-2 font-semibold">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Coba Lagi
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1 h-9 text-xs gap-2 border-white/10 hover:bg-white/5">
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
        className={`w-full h-full object-contain transition-all duration-1000 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${props.className || ''}`}
      />

      {!isLoading && !error && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/10 text-[9px] font-bold py-0.5">LIVE HLS</Badge>
          </div>
      )}
    </div>
  );
}
