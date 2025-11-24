
'use client';

import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

export interface VideoHistoryItem {
    id: string;
    name: string;
    file: File;
}

const LOCAL_STORAGE_KEY = 'visionpulse-video-history';

// This is a file cache to hold the actual file object between page navigations.
// It's a workaround since we can't store the File object in localStorage.
let fileCache: File | null = null;

export function useVideoHistory() {
    const [currentVideo, _setCurrentVideo] = useState<VideoHistoryItem | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const { toast } = useToast();

    const setCurrentVideo = useCallback((videoItem: VideoHistoryItem | null) => {
        _setCurrentVideo(videoItem);

        if (videoItem) {
            // Store metadata in localStorage
            const dataToStore = { id: videoItem.id, name: videoItem.name, fileName: videoItem.file.name, type: videoItem.file.type };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
            
            // Keep the file object in the session cache
            fileCache = videoItem.file;

            // Create and set the object URL
            const url = URL.createObjectURL(videoItem.file);
            setVideoSrc(url);
        } else {
            // Clear localStorage, file cache, and video source
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            fileCache = null;
            if (videoSrc) {
                URL.revokeObjectURL(videoSrc);
            }
            setVideoSrc(null);
        }
    }, [videoSrc]);

    const loadVideo = useCallback(() => {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (parsedData && parsedData.id && parsedData.name) {
                    let file: File;
                    // Check if the file is in our session cache
                    if (fileCache && fileCache.name === parsedData.fileName) {
                         file = fileCache;
                    } else {
                        // If not, create a dummy file. The user will need to re-upload for analysis.
                        file = new File([], parsedData.fileName, { type: parsedData.type });
                        toast({
                            title: "Sesi Video Dipulihkan",
                            description: `Video "${parsedData.name}" dimuat. Unggah kembali file jika ingin menganalisis ulang.`,
                        });
                    }
                    const videoItem = { ...parsedData, file };
                    _setCurrentVideo(videoItem);
                    const url = URL.createObjectURL(file);
                    setVideoSrc(url);
                }
            } catch (error) {
                console.error("Failed to parse video history from localStorage", error);
            }
        }
    }, [toast]);
    
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        // If file size is 0, it means it's a dummy file from a restored session.
        if (file.size === 0) {
            reject(new Error("File video tidak ditemukan. Harap unggah kembali file di halaman Riwayat untuk melanjutkan analisis."));
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    return { currentVideo, setCurrentVideo, videoSrc, loadVideo, toBase64 };
}
