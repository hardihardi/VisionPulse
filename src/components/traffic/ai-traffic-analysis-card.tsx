
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getTrafficVideoAnalysis } from '@/app/(actions)/summarize-video';
import type { SummarizeTrafficVideoOutput } from '@/ai/flows/summarize-traffic-video';
import { cn } from '@/lib/utils';

interface AiTrafficAnalysisCardProps {
  isAnalyzing: boolean;
  videoDataUri: string | null;
}

export function AiTrafficAnalysisCard({ isAnalyzing, videoDataUri }: AiTrafficAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<SummarizeTrafficVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateAnalysis = async () => {
    if (!videoDataUri) {
      toast({
        title: 'Video Tidak Tersedia',
        description: 'Analisis AI hanya dapat dilakukan pada video yang diunggah dari file. Video dari URL tidak didukung untuk fitur ini.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    const { result, error } = await getTrafficVideoAnalysis({ videoDataUri });

    if (error) {
      toast({
        title: 'Gagal Membuat Analisis',
        description: error,
        variant: 'destructive',
      });
    } else if (result) {
      setAnalysis(result);
       toast({
        title: 'Analisis Selesai',
        description: 'Laporan analisis video telah berhasil dibuat.',
      });
    }
    setIsLoading(false);
  };

  const getCongestionVariant = (congestion?: SummarizeTrafficVideoOutput['congestionLevel']) => {
    switch (congestion) {
      case 'Padat': return 'destructive';
      case 'Sedang': return 'default';
      case 'Rendah': return 'secondary';
      default: return 'outline';
    }
  };

  const isButtonDisabled = isLoading || !isAnalyzing || !videoDataUri;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisis Video AI</CardTitle>
        <CardDescription>Dapatkan analisis mendalam dari file video aktif.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Menganalisis video... Ini mungkin memakan waktu.</span>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Ringkasan</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">{analysis.summary}</p>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tingkat Kepadatan:</span>
                <Badge variant={getCongestionVariant(analysis.congestionLevel)}>
                    {analysis.congestionLevel}
                </Badge>
            </div>
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimasi Waktu Puncak:</span>
                <span className="text-sm text-muted-foreground">{analysis.peakTime}</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Distribusi Kendaraan</h4>
              <div className="space-y-3">
                {analysis.vehicleDistribution.map((vehicle) => (
                  <div key={vehicle.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{vehicle.type}</span>
                      <span className="font-medium">{vehicle.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={vehicle.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button onClick={handleGenerateAnalysis} disabled={isButtonDisabled} className="w-full">
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isLoading ? 'Membuat...' : 'Buat Analisis'}
        </Button>
        {!videoDataUri && isAnalyzing &&
             <p className="text-xs text-muted-foreground text-center">Analisis AI hanya tersedia untuk video dari file.</p>
        }
      </CardContent>
    </Card>
  );
}
