'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { getTrafficPrediction } from '@/app/(actions)/predict-traffic';
import type { TrafficDataPoint } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import type { PredictTrafficFlowOutput } from '@/ai/flows/predict-traffic-flow';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface AiPredictionProps {
  trafficData: TrafficDataPoint[];
  locationName: string;
}

export function AiPrediction({ trafficData, locationName }: AiPredictionProps) {
  const [prediction, setPrediction] = useState<PredictTrafficFlowOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePrediction = async () => {
    setIsLoading(true);
    setPrediction(null);
    
    if (!trafficData || trafficData.length < 10) {
       toast({
        title: "Data Tidak Cukup",
        description: "Membutuhkan setidaknya 10 titik data untuk membuat prakiraan.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const formattedData = trafficData.map(d => ({
      timestamp: new Date(d.timestamp).toISOString(),
      licensePlates: d.licensePlates,
    }));

    const result = await getTrafficPrediction({ trafficData: formattedData, locationName });

    if (result.error) {
      toast({
        title: "Gagal Membuat Prakiraan",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.result) {
      setPrediction(result.result);
    }
    setIsLoading(false);
  };
  
  const getCongestionVariant = (congestion: PredictTrafficFlowOutput['predictedCongestion']) => {
    switch (congestion) {
        case 'Padat': return 'destructive';
        case 'Sedang': return 'default';
        case 'Rendah': return 'secondary';
        default: return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prakiraan Lalu Lintas AI</CardTitle>
        <CardDescription>Prediksi volume lalu lintas untuk jam-jam mendatang.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {prediction && (
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Prediksi Kepadatan:</span>
                <Badge variant={getCongestionVariant(prediction.predictedCongestion)}>
                    {prediction.predictedCongestion}
                </Badge>
            </div>
            <div className="text-sm p-3 bg-muted/50 rounded-md border border-muted">
              {prediction.forecast}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Membuat prakiraan...</span>
          </div>
        )}
        <Button onClick={handleGeneratePrediction} disabled={isLoading || locationName.includes('Mendeteksi')} className="w-full">
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isLoading ? 'Membuat...' : 'Buat Prakiraan'}
        </Button>
      </CardContent>
    </Card>
  );
}
