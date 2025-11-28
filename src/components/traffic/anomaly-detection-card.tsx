
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
      <CardHeader>
        <CardTitle>Deteksi Anomali</CardTitle>
        <CardDescription>Peristiwa penting dari analisis video.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {!isAnalyzing || anomalies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                    <AlertTriangle className="w-10 h-10 mb-2" />
                    <p>{isAnalyzing ? "Tidak ada anomali terdeteksi." : "Mulai analisis untuk mendeteksi anomali."}</p>
                </div>
            ) : (
                anomalies.map(anomaly => (
                    <div key={anomaly.id} className={cn("p-3 rounded-lg border", getSeverityClass(anomaly.severity))}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className={cn("w-5 h-5 mt-1 flex-shrink-0", getSeverityIconColor(anomaly.severity))} />
                            <div className="flex-grow">
                                <p className="font-medium text-sm">{anomaly.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
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
