
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
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Nama video harus minimal 3 karakter.",
  }),
  video: z.instanceof(File, { message: "Video harus diunggah." })
    .refine(file => file.size > 0, "Video harus diunggah."),
});

interface VideoUploadFormProps {
  onVideoUpload: (name: string, file: File) => void;
}

export function VideoUploadForm({ onVideoUpload }: VideoUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      video: undefined,
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    onVideoUpload(values.name, values.video);
    toast({
      title: "Video Ditambahkan",
      description: `"${values.name}" telah ditambahkan ke riwayat.`,
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unggah Video Baru</CardTitle>
        <CardDescription>Beri nama dan unggah video untuk dianalisis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Video</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Lalu Lintas Pagi Hari" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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

            <Button type="submit" className="w-full">Simpan ke Riwayat</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
