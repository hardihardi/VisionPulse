'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVideoHistory, VideoHistoryItem } from '@/hooks/use-video-history';
import { PlusCircle, MoreHorizontal, Link as LinkIcon, Upload, PlayCircle, Edit, Trash2 } from 'lucide-react';

// Form Schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Nama video harus minimal 3 karakter." }),
  sourceType: z.enum(['file', 'url']),
  file: z.instanceof(File).optional(),
  url: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.sourceType === 'url' && (!data.url || !z.string().url().safeParse(data.url).success)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Harap masukkan URL yang valid.",
            path: ["url"],
        });
    }
    if (data.sourceType === 'file' && !data.file) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Harap unggah sebuah file video.",
            path: ["file"],
        });
    }
});

type VideoSourceFormValues = z.infer<typeof formSchema>;


// The Form component itself
interface VideoSourceFormProps {
    onFormSubmit: (values: VideoSourceFormValues) => void;
    initialData?: VideoHistoryItem | null;
    setOpen: (open: boolean) => void;
}

function VideoSourceForm({ onFormSubmit, initialData, setOpen }: VideoSourceFormProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const form = useForm<VideoSourceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            sourceType: initialData?.source.type || 'url',
            file: initialData?.source.type === 'file' ? initialData.source.file : undefined,
            url: initialData?.source.type === 'url' ? initialData.source.url : "",
        },
    });

    const sourceType = form.watch("sourceType");

    function onSubmit(values: VideoSourceFormValues) {
        onFormSubmit(values);
        setOpen(false);
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nama Lokasi/Video</FormLabel>
                        <FormControl>
                            <Input placeholder="Contoh: Lalu Lintas Pagi Hari" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="sourceType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipe Sumber</FormLabel>
                        <FormControl>
                            <Tabs value={field.value} onValueChange={(value) => field.onChange(value as 'file' | 'url')} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="url">URL</TabsTrigger>
                                <TabsTrigger value="file">File</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                {sourceType === 'url' && (
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Video (YouTube, dll)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="https://contoh.com/video.mp4" {...field} className="pl-9" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}

                {sourceType === 'file' && (
                     <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>File Video</FormLabel>
                            <FormControl>
                            <div>
                                <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Pilih File
                                </Button>
                                <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="video/*"
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                                />
                                {field.value && <span className="ml-4 text-sm text-muted-foreground truncate">{field.value.name}</span>}
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Batal</Button>
                    </DialogClose>
                    <Button type="submit">{initialData ? 'Simpan Perubahan' : 'Tambah Sumber'}</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

// Main Page Component
export default function HistoryPage() {
  const { videos, addVideo, updateVideo, deleteVideo, analyzeVideo, activeVideo } = useVideoHistory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoHistoryItem | null>(null);

  const handleFormSubmit = (values: VideoSourceFormValues) => {
    // This assertion is safe because the form schema validates it
    const file = values.file!;
    const url = values.url!;

    const videoData: Omit<VideoHistoryItem, 'id'> = {
        name: values.name,
        source: values.sourceType === 'url' 
            ? { type: 'url', url: url } 
            : { 
                type: 'file', 
                file: file, 
                fileName: file.name,
                fileType: file.type,
              }
    };
    
    if (editingVideo) {
        updateVideo(editingVideo.id, videoData);
    } else {
        addVideo(videoData);
    }
  };

  const openEditDialog = (video: VideoHistoryItem) => {
    setEditingVideo(video);
    setDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setEditingVideo(null);
    setDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <DashboardHeader 
              title="Manajemen Sumber Video"
              description="Kelola, analisis, dan pratinjau semua sumber video lalu lintas Anda." 
            />
            <main className="grid gap-6">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Daftar Sumber Video</CardTitle>
                                <CardDescription>Pilih video untuk dianalisis, atau tambahkan sumber baru.</CardDescription>
                            </div>
                            <Button onClick={openAddDialog}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Sumber Baru
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead className="hidden md:table-cell">Tipe</TableHead>
                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {videos.length > 0 ? videos.map(video => (
                                <TableRow key={video.id} className={video.id === activeVideo?.id ? 'bg-muted/50' : ''}>
                                    <TableCell className="font-medium">{video.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">{video.source.type === 'url' ? 'URL' : 'File'}</TableCell>
                                    <TableCell className="hidden md:table-cell">{video.id === activeVideo?.id ? 'Aktif' : 'Tidak Aktif'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => analyzeVideo(video.id)} className="mr-2">
                                            <PlayCircle className="mr-2 h-4 w-4" /> Analisis
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Buka menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(video)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Sunting
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Hapus
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini akan menghapus sumber video "{video.name}" secara permanen.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteVideo(video.id)}>Hapus</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Belum ada sumber video. Silakan tambahkan satu.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                       </Table>
                    </CardContent>
                  </Card>

                  <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                          <DialogTitle>{editingVideo ? 'Sunting Sumber Video' : 'Tambah Sumber Video Baru'}</DialogTitle>
                          <DialogDescription>
                              {editingVideo ? `Perbarui detail untuk "${editingVideo.name}".` : 'Masukkan detail untuk sumber video baru Anda.'}
                          </DialogDescription>
                      </DialogHeader>
                      <VideoSourceForm onFormSubmit={handleFormSubmit} initialData={editingVideo} setOpen={setDialogOpen} />
                  </DialogContent>
              </Dialog>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
