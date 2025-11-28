
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';
import type { RefObject } from 'react';

interface ExportReportProps {
  isAnalyzing: boolean;
  trafficData: any[]; // Data from the TrafficCountingChart
  chartRef: RefObject<HTMLDivElement>;
}

export function ExportReport({ isAnalyzing, trafficData, chartRef }: ExportReportProps) {
  const { toast } = useToast();

  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) {
      return "";
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  const downloadCSV = (data: any[]) => {
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `laporan_traffic_counting_${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const downloadXLSX = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TrafficData");
    XLSX.writeFile(workbook, `laporan_traffic_counting_${new Date().toISOString()}.xlsx`);
  }

  const downloadChartImage = () => {
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
            link.download = `grafik_traffic_counting_${new Date().toISOString()}.png`;
            link.href = dataUrl;
            link.click();
            toast({
              title: "Ekspor Grafik Dimulai",
              description: `Grafik Anda sedang diunduh...`,
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
    const exportDataAvailable = isAnalyzing && trafficData.length > 0;
    
    if (!exportDataAvailable) {
       toast({
          title: "Ekspor Gagal",
          description: `Tidak ada data untuk diekspor. Mulai analisis untuk mengumpulkan data.`,
          variant: "destructive"
        });
        return;
    }

    if (type === 'CSV (Raw)') {
      downloadCSV(trafficData);
      toast({
        title: "Ekspor Laporan Dimulai",
        description: `Laporan ${type} Anda sedang diunduh...`,
      });
    } else if (type === 'XLSX') {
      downloadXLSX(trafficData);
       toast({
        title: "Ekspor Laporan Dimulai",
        description: `Laporan ${type} Anda sedang diunduh...`,
      });
    } else if (type === 'Grafik Traffic Counting') {
        downloadChartImage();
    } else {
      toast({
        title: "Fitur Belum Tersedia",
        description: `Ekspor untuk laporan ${type} akan segera hadir.`,
      });
    }
  };

  const buttons = [
    { type: 'XLSX', label: 'Ekspor XLSX', enabled: true },
    { type: 'CSV (Raw)', label: 'Ekspor CSV', enabled: true },
    { type: 'Grafik Traffic Counting', label: 'Grafik Counting', enabled: true },
    { type: 'Grafik Moving Average', label: 'Grafik Moving Avg', enabled: false },
    { type: 'Grafik Volume Kendaraan', label: 'Grafik Volume', enabled: false },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ekspor Laporan</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {buttons.map((btn) => (
          <Button
            key={btn.type}
            variant={btn.enabled ? 'default' : 'outline'}
            onClick={() => handleExport(btn.type)}
            disabled={!isAnalyzing && btn.enabled}
            title={!isAnalyzing && btn.enabled ? "Mulai analisis untuk mengaktifkan ekspor" : ""}
          >
            {btn.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
