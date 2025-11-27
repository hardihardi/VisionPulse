
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, Link } from "lucide-react";
import { useRef, useImperativeHandle, forwardRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VideoHistoryItem } from "@/hooks/use-video-history";


const formSchema = z.object({
  name: z.string().min(3, {
    message: "Nama video harus minimal 3 karakter.",
  }),
  video: z.instanceof(File).optional(),
  url: z.string().url({ message: "Harap masukkan URL yang valid." }).optional(),
}).refine(data => data.video || data.url, {
  message: "Anda harus mengunggah file atau menyediakan URL.",
  path: ["video"],
});


interface VideoUploadFormProps {
  onVideoSelect: (item: VideoHistoryItem) => void;
}


export interface VideoUploadFormHandles {
  focusNameInput: () => void;
}

export const VideoUploadForm = forwardRef<VideoUploadFormHandles, VideoUploadFormProps>(
  ({ onVideoSelect }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("upload");

    useImperativeHandle(ref, () => ({
      focusNameInput() {
        nameInputRef.current?.focus();
      }
    }));

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        video: undefined,
        url: "",
      },
    });

    const handleUploadClick = () => {
      fileInputRef.current?.click();
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        const newVideoItem: Omit<VideoHistoryItem, 'source'> & { source?: VideoHistoryItem['source'] } = {
            id: Date.now().toString(),
            name: values.name,
        };

        if (activeTab === 'upload' && values.video) {
            newVideoItem.source = { type: 'file', file: values.video };
            onVideoSelect(newVideoItem as VideoHistoryItem);
            toast({
                title: "Video Ditambahkan",
                description: `"${values.name}" telah ditambahkan dan dijadikan video aktif.`,
            });
        } else if (activeTab === 'url' && values.url) {
            newVideoItem.source = { type: 'url', url: values.url };
            onVideoSelect(newVideoItem as VideoHistoryItem);
            toast({
                title: "Video dari URL Ditambahkan",
                description: `Video dari tautan "${values.name}" telah dijadikan video aktif.`,
            });
        } else {
             toast({
                title: "Input Tidak Lengkap",
                description: "Silakan pilih file atau masukkan URL yang valid.",
                variant: "destructive",
            });
            return;
        }

        form.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }


    return (
      <Card>
        <CardHeader>
          <CardTitle>Unggah Video Baru</CardTitle>
          <CardDescription>Pilih metode input video untuk dianalisis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Unggah File</TabsTrigger>
              <TabsTrigger value="url">Gunakan URL</TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Video</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Lalu Lintas Pagi Hari" 
                          {...field}
                          ref={nameInputRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <TabsContent value="upload" className="space-y-4 m-0">
                  <FormField
                    control={form.control}
                    name="video"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Video</FormLabel>
                        <FormControl>
                          <div>
                            <Button type="button" size="sm" variant="outline" onClick={handleUploadClick}>
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
                </TabsContent>

                <TabsContent value="url" className="space-y-4 m-0">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Video</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="https://contoh.com/video.mp4" 
                                    {...field} 
                                    className="pl-9"
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <Button type="submit" className="w-full">Simpan ke Riwayat</Button>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
);

VideoUploadForm.displayName = 'VideoUploadForm';
