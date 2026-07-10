"use client"

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2, ExternalLink, RefreshCw, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [hlsStats, setHlsStats] = useState<{latency: number, bandwidth: number} | null>(null);

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

    const loadTimeout = setTimeout(() => {
        if (isLoading && !error) {
            setError("Waktu tunggu pemuatan stream habis. Kemungkinan masalah koneksi atau CORS.");
            setIsLoading(false);
        }
    }, 20000);

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60,
            maxBufferLength: 15,
            manifestLoadingMaxRetry: 3,
            manifestLoadingRetryDelay: 1000,
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
            videoRef.current?.play().catch(() => {
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(pErr => console.error("Autoplay failed", pErr));
                }
            });
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, (event: any, data: any) => {
           setHlsStats({
               latency: data.stats.tfirst - data.stats.trequest,
               bandwidth: Math.round(data.stats.bw / 1024)
           });
        });

        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
             console.error("HLS Fatal Error:", data);
             clearTimeout(loadTimeout);
             switch (data.type) {
               case Hls.ErrorTypes.NETWORK_ERROR:
                 setError("Masalah jaringan atau CORS terdeteksi. Stream ini mungkin memblokir akses browser langsung.");
                 break;
               case Hls.ErrorTypes.MEDIA_ERROR:
                 setError("Gagal memproses data media. Mencoba memulihkan...");
                 hls?.recoverMediaError();
                 break;
               default:
                 setError("Kesalahan fatal saat memuat stream HLS.");
                 break;
             }
             setIsLoading(false);
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
        videoRef.current.addEventListener('loadedmetadata', () => {
          clearTimeout(loadTimeout);
          setIsLoading(false);
          if (autoPlay) videoRef.current?.play();
        });
      } else {
        setError("Browser tidak mendukung HLS.");
        setIsLoading(false);
      }
    } else {
      videoRef.current.src = src;
      videoRef.current.onloadeddata = () => {
          clearTimeout(loadTimeout);
          setIsLoading(false);
      };
      videoRef.current.onerror = () => {
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
  }, [src, isHls, youtubeUrl, autoPlay, retryCount]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-md h-full min-h-[300px]">
        <Alert variant="destructive" className="max-w-md border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-bold">Kesalahan Stream</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-[11px] leading-relaxed">{error}</p>
            <div className="flex flex-col gap-2 pt-2">
                <p className="text-[10px] opacity-80 italic bg-black/5 p-2 rounded">
                    Info: CCTV Bekasi (eofficev2) seringkali memblokir akses langsung browser (CORS).
                    Pilih tab <strong>LIVE</strong> untuk melihat hasil analisis dari Backend AI kami.
                </p>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRetryCount(c => c+1)} className="h-8 text-[10px] flex-1 bg-background">
                        <RefreshCw className="w-3 h-3 mr-1" /> Coba Lagi
                    </Button>
                    <Button size="sm" variant="secondary" asChild className="h-8 text-[10px] flex-1">
                        <a href={src} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" /> Buka Tab Baru
                        </a>
                    </Button>
                </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (youtubeUrl && !isAnalyzing) {
    return (
      <div className="relative w-full h-full min-h-[300px] bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          src={youtubeUrl}
          title="YouTube"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className={className}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] bg-black group">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
      )}
      <video
        ref={videoRef}
        className={`${className} \${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        controls={controls}
        muted={muted}
        loop={loop}
        playsInline
        crossOrigin="anonymous"
      />

      {hlsStats && !isLoading && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Badge variant="outline" className="bg-black/40 text-[9px] text-white border-white/20 backdrop-blur-sm">
                  <Activity className="w-2.5 h-2.5 mr-1 text-green-400" />
                  {hlsStats.bandwidth} KB/s
              </Badge>
          </div>
      )}
    </div>
  );
}
