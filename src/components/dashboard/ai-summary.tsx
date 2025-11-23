"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { getTrafficSummary } from '@/app/(actions)/summarize';
import type { TrafficDataPoint } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AiSummaryProps {
  trafficData: TrafficDataPoint[];
}

export function AiSummary({ trafficData }: AiSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary(null);

    const formattedData = trafficData.map(d => ({
      timestamp: new Date(d.timestamp).toISOString(),
      count: d.licensePlates,
      value: d.pcu,
    }));
    
    const licensePlateCounts = formattedData.map(({ timestamp, count }) => ({ timestamp, count }));
    const pcuValues = formattedData.map(({ timestamp, value }) => ({ timestamp, value }));

    const result = await getTrafficSummary({ licensePlateCounts, pcuValues });

    if (result.error) {
      toast({
        title: "Summary Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setSummary(result.summary);
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Traffic Summary</CardTitle>
        <CardDescription>Generate an AI-powered analysis of the current traffic patterns.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <div className="text-sm p-3 bg-muted/50 rounded-md border border-muted">
            {summary}
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Analyzing patterns...</span>
          </div>
        )}
        <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full">
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </Button>
      </CardContent>
    </Card>
  );
}
