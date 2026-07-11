"use client"

import React, { useRef } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { useVideoHistory } from '@/hooks/use-video-history';
import { VideoUploadForm, VideoUploadFormHandles } from '@/components/dashboard/video-upload-form';
import { VideoHistoryCard } from '@/components/traffic/video-history-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileVideo,
  Trash2,
  PlayCircle,
  Plus,
  HardDrive,
  Clock,
  Link as LinkIcon,
  Search,
  MoreVertical
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';

export default function VideoStoragePage() {
  const { videos, activeVideo, addVideo, deleteVideo, analyzeVideo } = useVideoHistory();
  const uploadFormRef = useRef<VideoUploadFormHandles>(null);

  const handleAddNew = () => {
    uploadFormRef.current?.focusNameInput();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <DashboardHeader
              title="Video Storage Manager"
              description="Manage your video library for traffic analysis. Upload local files or add stream URLs."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form and Active Video */}
              <div className="lg:col-span-1 space-y-6">
                <VideoUploadForm
                  ref={uploadFormRef}
                  onVideoSelect={(item) => addVideo(item)}
                />

                <VideoHistoryCard
                  currentVideo={activeVideo}
                  onDeleteCurrentVideo={() => activeVideo && deleteVideo(activeVideo.id)}
                  onAddNew={handleAddNew}
                />
              </div>

              {/* Right Column: Video List */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-border/50 shadow-md h-full flex flex-col">
                  <CardHeader className="p-4 sm:p-6 border-b border-border/50 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-primary" />
                        Stored Videos
                      </CardTitle>
                      <CardDescription>All available sources for analysis.</CardDescription>
                    </div>
                    <div className="relative w-48 sm:w-64 hidden sm:block">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search videos..." className="pl-9 h-9 bg-accent/20 border-border/50" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-grow">
                    <div className="divide-y divide-border/50">
                      {videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                          <FileVideo className="h-12 w-12 mb-4 opacity-20" />
                          <p>No videos stored yet.</p>
                          <Button variant="link" onClick={handleAddNew}>Upload your first video</Button>
                        </div>
                      ) : (
                        videos.map((video) => (
                          <div
                            key={video.id}
                            className={`flex items-center justify-between p-4 transition-colors hover:bg-accent/10 ${activeVideo?.id === video.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'pl-5'}`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${video.source.type === 'url' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {video.source.type === 'url' ? <LinkIcon className="h-5 w-5" /> : <FileVideo className="h-5 w-5" />}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold truncate flex items-center gap-2">
                                  {video.name}
                                  {activeVideo?.id === video.id && (
                                    <Badge variant="secondary" className="h-4 text-[9px] py-0 px-1 font-bold bg-primary/20 text-primary uppercase">Active</Badge>
                                  )}
                                </h3>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                    <Clock className="h-3 w-3" />
                                    {new Date(parseInt(video.id)).toLocaleDateString('id-ID')}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    {video.source.type === 'url' ? 'URL Stream' : 'Local File'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant={activeVideo?.id === video.id ? "secondary" : "default"}
                                className="h-8 gap-1.5 font-bold"
                                onClick={() => analyzeVideo(video.id)}
                              >
                                <PlayCircle className="h-3.5 w-3.5" />
                                {activeVideo?.id === video.id ? 'Open Dash' : 'Analyze'}
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() => deleteVideo(video.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
