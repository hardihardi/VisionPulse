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
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => handleExport('XLSX')}>Ekspor XLSX</Button>
        <Button variant="outline" onClick={() => handleExport('CSV (Raw)')}>Ekspor CSV</Button>
        <Button variant="outline" onClick={() => handleExport('Grafik Traffic Counting')}>Grafik Counting</Button>
        <Button variant="outline" onClick={() => handleExport('Grafik Moving Average')}>Grafik Moving Avg</Button>
        <Button variant="outline" onClick={() => handleExport('Grafik Volume Kendaraan')}>Grafik Volume</Button>
      </CardContent>
    </Card>
  );
}
