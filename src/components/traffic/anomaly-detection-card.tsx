'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Anomaly } from '@/lib/types';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AnomalyDetectionCardProps {
  anomalies: Anomaly[];
  isAnalyzing: boolean;
}

export function AnomalyDetectionCard({ anomalies, isAnalyzing }: AnomalyDetectionCardProps) {
  const getSeverityClass = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500/50 bg-blue-500/10';
      default:
        return 'border-muted';
    }
  };

  const getSeverityIconColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-base font-semibold">Deteksi Anomali</CardTitle>
        <CardDescription className="text-xs">Peristiwa penting dari analisis video.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {!isAnalyzing || anomalies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground/60">
                    <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs italic">{isAnalyzing ? "Tidak ada anomali terdeteksi." : "Mulai analisis untuk mendeteksi anomali."}</p>
                </div>
            ) : (
                anomalies.map(anomaly => (
                    <div key={anomaly.id} className={cn("p-2.5 rounded-lg border transition-colors", getSeverityClass(anomaly.severity))}>
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", getSeverityIconColor(anomaly.severity))} />
                            <div className="flex-grow">
                                <p className="font-medium text-[13px] leading-snug">{anomaly.description}</p>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1.5 opacity-80">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDistanceToNow(anomaly.timestamp, { addSuffix: true, locale: id })}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{anomaly.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}
