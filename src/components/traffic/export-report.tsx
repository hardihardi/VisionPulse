
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExportReportProps {
  isAnalyzing: boolean;
  trafficData: any[]; // Data from the TrafficCountingChart
}

export function ExportReport({ isAnalyzing, trafficData }: ExportReportProps) {
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

  const handleExport = (type: string) => {
    if (type === 'CSV (Raw)') {
      if (trafficData.length > 0) {
        downloadCSV(trafficData);
        toast({
          title: "Ekspor Laporan Dimulai",
          description: `Laporan ${type} Anda sedang diunduh...`,
        });
      } else {
        toast({
          title: "Ekspor Gagal",
          description: `Tidak ada data untuk diekspor.`,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Fitur Belum Tersedia",
        description: `Ekspor untuk laporan ${type} akan segera hadir.`,
      });
    }
  };

  const buttons = [
    { type: 'XLSX', label: 'Ekspor XLSX' },
    { type: 'CSV (Raw)', label: 'Ekspor CSV' },
    { type: 'Grafik Traffic Counting', label: 'Grafik Counting' },
    { type: 'Grafik Moving Average', label: 'Grafik Moving Avg' },
    { type: 'Grafik Volume Kendaraan', label: 'Grafik Volume' },
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
            variant={btn.type === 'CSV (Raw)' ? 'default' : 'outline'}
            onClick={() => handleExport(btn.type)}
            disabled={!isAnalyzing && btn.type === 'CSV (Raw)'}
            title={!isAnalyzing && btn.type === 'CSV (Raw)' ? "Mulai analisis untuk mengaktifkan ekspor" : ""}
          >
            {btn.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
