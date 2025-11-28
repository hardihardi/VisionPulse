'use client';

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export default function PlateSearchPage() {

  // Data tiruan untuk tampilan awal
  const mockDetections = [
    // { id: '1', plate: 'B 1234 ABC', timestamp: '2024-07-29 10:15:23', videoName: 'Lalu Lintas Pagi' },
    // { id: '2', plate: 'D 5678 XYZ', timestamp: '2024-07-29 10:17:45', videoName: 'Lalu Lintas Pagi' },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <MainSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <DashboardHeader 
              title="Pencarian Plat Nomor" 
              description="Cari riwayat deteksi plat nomor dari seluruh video yang dianalisis." 
            />
            <main className="grid gap-6">
               <Card>
                <CardHeader>
                    <CardTitle>Formulir Pencarian</CardTitle>
                    <CardDescription>Masukkan plat nomor untuk memulai pencarian.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="flex w-full items-center space-x-2">
                        <div className="relative flex-grow">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="text" placeholder="Contoh: B 1234 ABC" className="pl-9" />
                        </div>
                        <Button type="submit">Cari Plat</Button>
                    </form>
                </CardContent>
               </Card>
               <Card>
                <CardHeader>
                    <CardTitle>Hasil Pencarian</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Plat Nomor</TableHead>
                            <TableHead>Waktu Deteksi</TableHead>
                            <TableHead>Nama Video</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockDetections.length > 0 ? mockDetections.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.plate}</TableCell>
                                    <TableCell>{d.timestamp}</TableCell>
                                    <TableCell>{d.videoName}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        Belum ada hasil. Silakan mulai pencarian.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
               </Card>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
