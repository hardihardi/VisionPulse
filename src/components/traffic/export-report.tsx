
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExportReportProps {
  isAnalyzing: boolean;
}

export function ExportReport({ isAnalyzing }: ExportReportProps) {
  const { toast } = useToast();

  const handleExport = (type: string) => {
    toast({
      title: "Ekspor Laporan Dimulai",
      description: `Laporan ${type} Anda sedang dibuat...`,
    });
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
            variant="outline"
            onClick={() => handleExport(btn.type)}
            disabled={!isAnalyzing}
            title={!isAnalyzing ? "Mulai analisis untuk mengaktifkan ekspor" : ""}
          >
            {btn.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
