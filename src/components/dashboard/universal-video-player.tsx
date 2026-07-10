"use client"

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, ExternalLink, Play, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UniversalVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  url,
  title = "Video Player",
  className = "",
  poster = "",
  autoPlay = true,
  muted = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHls, setIsHls] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [isCORSProblem, setIsCORSProblem] = useState(false);

  useEffect(() => {
    // Reset states
    setError(null);
    setIsCORSProblem(false);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!url) return;

    // Check if YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setIsYouTube(true);
      setIsHls(false);
      return;
    }

    setIsYouTube(false);
    const isM3U8 = url.toLowerCase().includes('.m3u8');
    setIsHls(isM3U8);

    if (isM3U8 && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch(e => console.log("Autoplay blocked:", e));
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS Error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Network error encountered.");
                if (data.response && data.response.code === 0) {
                  setIsCORSProblem(true);
                }
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media error encountered.");
                hls.recoverMediaError();
                break;
              default:
                setError("Fatal error encountered. Cannot play video.");
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari)
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) {
            video.play().catch(e => console.log("Autoplay blocked:", e));
          }
        });
        video.addEventListener('error', (e) => {
          console.error("Native HLS Error:", e);
          setError("Failed to load stream in browser.");
        });
      } else {
        setError("Your browser does not support HLS playback.");
      }
    }

    // Final cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, autoPlay]);

  const getYouTubeEmbedUrl = (originalUrl: string) => {
    let videoId = '';
    if (originalUrl.includes('v=')) {
      videoId = originalUrl.split('v=')[1].split('&')[0];
    } else if (originalUrl.includes('youtu.be/')) {
      videoId = originalUrl.split('youtu.be/')[1].split('?')[0];
    } else if (originalUrl.includes('embed/')) {
      videoId = originalUrl.split('embed/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}`;
  };

  if (isYouTube) {
    return (
      <div className={`relative aspect-video w-full bg-black rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={getYouTubeEmbedUrl(url)}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full bg-slate-950 rounded-lg overflow-hidden group ${className}`}>
      {isHls ? (
        <>
          <video
            ref={videoRef}
            className="w-full h-full"
            poster={poster}
            muted={muted}
            controls
            playsInline
          />

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4 z-10">
              <Alert variant="destructive" className="max-w-md bg-slate-900 border-red-900/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Playback Error</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>{isCORSProblem ? "Browser blocked this stream (CORS)." : error}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="h-8 border-slate-700 hover:bg-slate-800">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Direct Link
                      </a>
                    </Button>
                    {isCORSProblem && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 py-1">
                        <Info className="h-3 w-3 mr-1" />
                        AI Analysis OK
                      </Badge>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
          <Play className="h-12 w-12 opacity-20" />
          <p className="text-sm font-medium">Video feed ready</p>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            {url ? "Processing Stream..." : "No Source"}
          </Badge>
        </div>
      )}

      <div className="absolute top-3 left-3 flex gap-2">
        <Badge className="bg-red-600 hover:bg-red-600 text-white border-0 shadow-lg px-2 py-0.5">
          LIVE AI FEED
        </Badge>
        {url.includes('SIMULATION') && (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">
            SIMULATION
          </Badge>
        )}
      </div>
    </div>
  );
};
