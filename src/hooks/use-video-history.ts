'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

export interface VideoHistoryItem {
    id: string;
    name: string;
    source: {
        type: 'file';
        file: File;
        // Store metadata for persistence
        fileName: string;
        fileType: string;
    } | {
        type: 'url';
        url: string;
    };
}

const HISTORY_KEY = 'visionpulse-video-history';
const ACTIVE_VIDEO_ID_KEY = 'visionpulse-active-video-id';
// This is a session-level cache for File objects, as they can't be stored in localStorage.
const fileCache = new Map<string, File>();

export function useVideoHistory() {
    const [videos, setVideos] = useState<VideoHistoryItem[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    // Load initial data from localStorage on mount
    useEffect(() => {
        try {
            const storedVideos = localStorage.getItem(HISTORY_KEY);
            const storedActiveId = localStorage.getItem(ACTIVE_VIDEO_ID_KEY);

            let loadedVideos: VideoHistoryItem[] = [];
            if (storedVideos) {
                const parsedData = JSON.parse(storedVideos);
                // Backwards compatibility check: ensure parsed data is an array
                const parsedVideos = Array.isArray(parsedData) ? parsedData : [];
                
                // Rehydrate videos, creating dummy files for file-based sources
                loadedVideos = parsedVideos.map((item: any) => {
                    if (item.source.type === 'file') {
                        const cachedFile = fileCache.get(item.id);
                        return {
                            ...item,
                            source: {
                                ...item.source,
                                file: cachedFile || new File([], item.source.fileName, { type: item.source.fileType }),
                            }
                        };
                    }
                    return item;
                });
            }
            
            if (loadedVideos.length === 0) {
                 // If no videos, add the default demo video
                const defaultVideo: VideoHistoryItem = {
                    id: 'default-youtube-video',
                    name: 'Live Demo - Lalu Lintas Cikarang',
                    source: {
                        type: 'url',
                        url: 'https://youtu.be/xrX2IqMyb-8'
                    }
                };
                loadedVideos.push(defaultVideo);
            }

            setVideos(loadedVideos);
            
            const activeId = storedActiveId && loadedVideos.some(v => v.id === storedActiveId)
                ? storedActiveId
                : loadedVideos[0]?.id || null;

            setActiveVideoId(activeId);

        } catch (error) {
            console.error("Failed to load video history from localStorage", error);
            // On error, start with the default demo video
            const defaultVideo: VideoHistoryItem = {
                id: 'default-youtube-video',
                name: 'Live Demo - Bundaran HI',
                source: {
                    type: 'url',
                    url: 'https://youtu.be/aGfshu1UFd0'
                }
            };
            setVideos([defaultVideo]);
            setActiveVideoId(defaultVideo.id);
        }
    }, []);

    // Memoize active video and its source URL
    const activeVideo = useMemo(() => videos.find(v => v.id === activeVideoId), [videos, activeVideoId]);
    const videoSrc = useMemo(() => {
        if (!activeVideo) return null;
        if (activeVideo.source.type === 'url') return activeVideo.source.url;
        if (activeVideo.source.file?.size > 0) {
            try {
                return URL.createObjectURL(activeVideo.source.file);
            } catch (e) {
                console.error("Error creating object URL", e);
                return null;
            }
        }
        return null;
    }, [activeVideo]);

    // Persist changes to localStorage
    const persistVideos = (updatedVideos: VideoHistoryItem[]) => {
        try {
            // Create a serializable version of the videos array
            const serializableVideos = updatedVideos.map(video => {
                if (video.source.type === 'file') {
                    // Don't store the file object itself
                    const { file, ...restOfSource } = video.source;
                    return { ...video, source: restOfSource };
                }
                return video;
            });
            localStorage.setItem(HISTORY_KEY, JSON.stringify(serializableVideos));
            setVideos(updatedVideos);
        } catch (error) {
            console.error("Failed to save video history to localStorage", error);
            toast({ title: "Gagal menyimpan riwayat video", variant: "destructive" });
        }
    };

    const addVideo = (video: Omit<VideoHistoryItem, 'id'>) => {
        const newVideo: VideoHistoryItem = { ...video, id: Date.now().toString() };
        
        if (newVideo.source.type === 'file') {
            fileCache.set(newVideo.id, newVideo.source.file);
        }
        
        const updatedVideos = [...videos, newVideo];
        persistVideos(updatedVideos);
        toast({ title: "Sumber Video Ditambahkan", description: `"${newVideo.name}" telah ditambahkan.` });
        return newVideo;
    };

    const updateVideo = (id: string, updatedVideo: Omit<VideoHistoryItem, 'id'>) => {
        if (updatedVideo.source.type === 'file') {
            fileCache.set(id, updatedVideo.source.file);
        }
        const updatedVideos = videos.map(v => v.id === id ? { ...updatedVideo, id } : v);
        persistVideos(updatedVideos);
        toast({ title: "Sumber Video Diperbarui", description: `"${updatedVideo.name}" telah diperbarui.` });
    };

    const deleteVideo = (id: string) => {
        const videoToDelete = videos.find(v => v.id === id);
        const updatedVideos = videos.filter(v => v.id !== id);
        
        fileCache.delete(id);
        persistVideos(updatedVideos);

        if (id === activeVideoId) {
            const newActiveId = updatedVideos[0]?.id || null;
            setActiveVideoIdAndPersist(newActiveId);
        }
        toast({ title: "Sumber Video Dihapus", description: `"${videoToDelete?.name}" telah dihapus.` });
    };

    const setActiveVideoIdAndPersist = (id: string | null) => {
        localStorage.setItem(ACTIVE_VIDEO_ID_KEY, id || '');
        setActiveVideoId(id);
    };
    
    const analyzeVideo = (id: string) => {
        const videoToAnalyze = videos.find(v => v.id === id);
        if (!videoToAnalyze) return;

        if (videoToAnalyze.source.type === 'file' && videoToAnalyze.source.file.size === 0) {
            toast({
                title: 'File Tidak Ditemukan',
                description: 'Unggah kembali file video untuk melanjutkan analisis.',
                variant: 'destructive'
            });
            return;
        }

        setActiveVideoIdAndPersist(id);
        toast({ title: 'Analisis Dimulai', description: `Menganalisis "${videoToAnalyze.name}".`});
        router.push('/');
    };

    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        if (file.size === 0) {
            reject(new Error("File video tidak ditemukan. Harap unggah kembali file di halaman Riwayat untuk melanjutkan analisis."));
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    return { videos, activeVideo, videoSrc, addVideo, updateVideo, deleteVideo, analyzeVideo, setActiveVideoId: setActiveVideoIdAndPersist, toBase64 };
}
