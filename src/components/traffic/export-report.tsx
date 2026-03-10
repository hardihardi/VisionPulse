
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toPng } from 'html-to-image';
import type { RefObject } from 'react';
import { Download, FileSpreadsheet, FileText, Image as ImageIcon } from 'lucide-react';

interface ExportReportProps {
  isAnalyzing: boolean;
  trafficData: any[]; // Data from the TrafficCountingChart
  countingChartRef: RefObject<HTMLDivElement>;
  movingAverageChartRef: RefObject<HTMLDivElement>;
  vehicleComparisonChartRef: RefObject<HTMLDivElement>;
}

export function ExportReport({ isAnalyzing, trafficData, countingChartRef, movingAverageChartRef, vehicleComparisonChartRef }: ExportReportProps) {
  const { toast } = useToast();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const downloadFromBackend = async (fmt: 'csv' | 'xlsx') => {
    try {
        const response = await fetch(`${BACKEND_URL}/export/${fmt}`);
        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan_traffic_${new Date().toISOString()}.${fmt}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
            title: "Ekspor Berhasil",
            description: `Laporan ${fmt.toUpperCase()} telah diunduh.`,
        });
    } catch (error) {
        toast({
            title: "Ekspor Gagal",
            description: "Tidak dapat mengunduh laporan dari server.",
            variant: "destructive"
        });
    }
  };

  const downloadChartImage = (chartRef: RefObject<HTMLDivElement>, chartName: string) => {
    if (!chartRef.current) {
        toast({
            title: "Ekspor Gagal",
            description: "Referensi grafik tidak ditemukan.",
            variant: "destructive"
        });
        return;
    }

    toPng(chartRef.current, { cacheBust: true, skipFonts: true })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `grafik_${chartName.replace(/ /g, '_')}_${new Date().toISOString()}.png`;
            link.href = dataUrl;
            link.click();
            toast({
              title: "Ekspor Grafik Dimulai",
              description: `Grafik ${chartName} Anda sedang diunduh...`,
            });
        })
        .catch((err) => {
            console.error(err);
            toast({
                title: "Ekspor Grafik Gagal",
                description: "Terjadi kesalahan saat membuat gambar dari grafik.",
                variant: "destructive"
            });
        });
  };

  const handleExport = (type: string) => {
    if (['XLSX', 'CSV'].includes(type) && !isAnalyzing && trafficData.length === 0) {
       toast({
          title: "Ekspor Gagal",
          description: `Tidak ada data untuk diekspor.`,
          variant: "destructive"
        });
        return;
    }

    if (type === 'CSV') {
      downloadFromBackend('csv');
    } else if (type === 'XLSX') {
      downloadFromBackend('xlsx');
    } else if (type === 'Grafik Counting') {
        downloadChartImage(countingChartRef, 'Traffic Counting');
    } else if (type === 'Grafik Moving Average') {
        downloadChartImage(movingAverageChartRef, 'Moving Average');
    } else if (type === 'Grafik Volume') {
        downloadChartImage(vehicleComparisonChartRef, 'Volume Kendaraan');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Download className="w-4 h-4" />
            Ekspor Laporan
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('XLSX')} disabled={!isAnalyzing && trafficData.length === 0}>
                <FileSpreadsheet className="w-3 h-3 mr-2" />
                XLSX
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('CSV')} disabled={!isAnalyzing && trafficData.length === 0}>
                <FileText className="w-3 h-3 mr-2" />
                CSV
            </Button>
        </div>
        <div className="space-y-2 pt-2 border-t">
            <Button variant="ghost" size="xs" className="w-full justify-start text-[10px]" onClick={() => handleExport('Grafik Counting')} disabled={!isAnalyzing}>
                <ImageIcon className="w-3 h-3 mr-2" />
                Unduh Grafik Counting
            </Button>
            <Button variant="ghost" size="xs" className="w-full justify-start text-[10px]" onClick={() => handleExport('Grafik Moving Average')} disabled={!isAnalyzing}>
                <ImageIcon className="w-3 h-3 mr-2" />
                Unduh Grafik Moving Avg
            </Button>
            <Button variant="ghost" size="xs" className="w-full justify-start text-[10px]" onClick={() => handleExport('Grafik Volume')} disabled={!isAnalyzing}>
                <ImageIcon className="w-3 h-3 mr-2" />
                Unduh Grafik Volume
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
