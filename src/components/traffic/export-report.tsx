"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function ExportReport() {
  const { toast } = useToast();

  const handleExport = (type: string) => {
    toast({
      title: "Ekspor Laporan",
      description: `Laporan ${type} sedang dibuat...`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ekspor Laporan</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => handleExport('XLSX')}>Ekspor XLSX</Button>
        <Button variant="outline" onClick={() => handleExport('CSV (Raw)')}>Ekspor CSV (Raw)</Button>
        <Button variant="outline" onClick={() => handleExport('Grafik Traffic Counting')}>Unduh Grafik Traffic Counting</Button>
        <Button variant="outline" onClick={() => handleExport('Grafik Moving Average')}>Unduh Grafik Moving Average</Button>
        <Button variant="outline" onClick={() => handleExport('Grafik Volume Kendaraan')}>Unduh Grafik Volume Kendaraan</Button>
      </CardContent>
    </Card>
  );
}
