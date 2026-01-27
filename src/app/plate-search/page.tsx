
'use client';

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { collection, query, where, getDocsFromServer, orderBy, limit } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Detection } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function PlateSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch latest detections on initial load
  useEffect(() => {
    const fetchLatestDetections = async () => {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const detectionsRef = collection(firestore, 'detections');
        const q = query(detectionsRef, orderBy('timestamp', 'desc'), limit(10));
        const querySnapshot = await getDocsFromServer(q);
        const latestDetections = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Add a check to ensure timestamp is not null
            if (!data.timestamp) {
              return null;
            }
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp.toDate(),
            } as Detection;
          })
          .filter((d): d is Detection => d !== null); // Filter out any null entries
        setResults(latestDetections);
      } catch (error) {
        console.error("Error fetching latest detections: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestDetections();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    if (!firestore) return;
    
    setIsLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const detectionsRef = collection(firestore, 'detections');
      const searchTermUpper = searchTerm.toUpperCase();
      
      // Firestore does not support case-insensitive search directly.
      // A common workaround is to search for a range.
      const q = query(
        detectionsRef, 
        where('plate', '>=', searchTermUpper), 
        where('plate', '<=', searchTermUpper + '\uf8ff'),
        orderBy('plate'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocsFromServer(q);
      const searchResults = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          if (!data.timestamp) {
            return null;
          }
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toDate(),
          } as Detection;
        })
        .filter((d): d is Detection => d !== null);
        
      setResults(searchResults);
    } catch (error) {
      console.error("Error searching detections: ", error);
    } finally {
      setIsLoading(false);
    }
  };

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
                    <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                        <div className="relative flex-grow">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="text" 
                              placeholder="Contoh: B 1234 ABC" 
                              className="pl-9"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Cari Plat
                        </Button>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                      <div className="flex justify-center items-center">
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                                        <span className="text-muted-foreground">Mencari...</span>
                                      </div>
                                    </TableCell>
                                </TableRow>
                            ) : results.length > 0 ? results.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.plate}</TableCell>
                                    <TableCell>{format(d.timestamp, "d MMMM yyyy, HH:mm:ss", { locale: id })}</TableCell>
                                    <TableCell>{d.videoName}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        {hasSearched ? "Tidak ada hasil ditemukan." : "10 deteksi terakhir ditampilkan. Silakan mulai pencarian."}
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
