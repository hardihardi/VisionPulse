'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';

export interface VideoHistoryItem {
    id: string;
    name: string;
    source: {
        type: 'file';
        file: File;
    } | {
        type: 'url';
        url: string;
    };
}


const LOCAL_STORAGE_KEY = 'visionpulse-video-history';

// This is a file cache to hold the actual file object between page navigations.
// It's a workaround since we can't store the File object in localStorage.
let fileCache: File | null = null;

export function useVideoHistory() {
    const [currentVideo, _setCurrentVideo] = useState<VideoHistoryItem | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const videoSrcRef = useRef(videoSrc);
    const { toast } = useToast();

    useEffect(() => {
        videoSrcRef.current = videoSrc;
    }, [videoSrc]);

    const setCurrentVideo = useCallback((videoItem: VideoHistoryItem | null) => {
        _setCurrentVideo(videoItem);

        // Revoke previous object URL if it exists
        if (videoSrcRef.current && videoSrcRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(videoSrcRef.current);
        }

        if (videoItem) {
            let dataToStore: any;
            if (videoItem.source.type === 'file') {
                const file = videoItem.source.file;
                dataToStore = { 
                    id: videoItem.id, 
                    name: videoItem.name, 
                    source: { 
                        type: 'file', 
                        fileName: file.name, 
                        fileType: file.type 
                    } 
                };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
                fileCache = file; // Cache the file object
                setVideoSrc(URL.createObjectURL(file));
            } else { // type is 'url'
                dataToStore = { 
                    id: videoItem.id, 
                    name: videoItem.name, 
                    source: { 
                        type: 'url', 
                        url: videoItem.source.url 
                    } 
                };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
                fileCache = null; // Clear file cache for URL type
                setVideoSrc(videoItem.source.url);
            }
        } else {
            // Clear everything
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            fileCache = null;
            setVideoSrc(null);
        }
    }, []);

    const loadVideo = useCallback(() => {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (parsedData && parsedData.id && parsedData.name && parsedData.source) {
                    let videoItem: VideoHistoryItem;
                    if (parsedData.source.type === 'file') {
                        let file: File;
                        if (fileCache && fileCache.name === parsedData.source.fileName) {
                            file = fileCache;
                        } else {
                            file = new File([], parsedData.source.fileName, { type: parsedData.source.fileType });
                             toast({
                                title: "Sesi Video Dipulihkan",
                                description: `Video "${parsedData.name}" dimuat. Unggah kembali file jika ingin menganalisis ulang.`,
                            });
                        }
                        videoItem = { 
                            id: parsedData.id,
                            name: parsedData.name,
                            source: { type: 'file', file }
                        };
                         if (videoItem.source.file.size > 0) {
                            setVideoSrc(URL.createObjectURL(videoItem.source.file));
                        } else {
                            setVideoSrc(null);
                        }
                    } else { // type is 'url'
                         videoItem = {
                            id: parsedData.id,
                            name: parsedData.name,
                            source: { type: 'url', url: parsedData.source.url }
                        };
                        setVideoSrc(videoItem.source.url);
                    }
                    _setCurrentVideo(videoItem);
                }
            } catch (error) {
                console.error("Failed to parse video history from localStorage", error);
            }
        } else {
            // If no video in local storage, set the default YouTube demo video
            const defaultVideo: VideoHistoryItem = {
                id: 'default-youtube-video',
                name: 'Live Demo - Bundaran HI',
                source: {
                    type: 'url',
                    url: 'https://youtu.be/aGfshu1UFd0'
                }
            };
            setCurrentVideo(defaultVideo);
        }
    }, [toast, setCurrentVideo]);
    
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
