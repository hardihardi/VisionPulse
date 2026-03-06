"use client";

import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface CumulativeVolumeChartProps {
    isAnalyzing: boolean;
    backendStats?: any;
}

export function CumulativeVolumeChart({ isAnalyzing, backendStats }: CumulativeVolumeChartProps) {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (!isAnalyzing) {
            setChartData([]);
            return;
        }

        if (backendStats && backendStats.counts) {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            
            const totalM = Object.values(backendStats.counts.Mendekat).reduce((a: any, b: any) => a + b, 0) as number;
            const totalJ = Object.values(backendStats.counts.Menjauh).reduce((a: any, b: any) => a + b, 0) as number;

            const newEntry = {
                time: timeStr,
                total: totalM + totalJ,
                mendekat: totalM,
                menjauh: totalJ,
            };

            setChartData(prev => {
                // To keep it "cumulative" and smooth in UI, we update every 2 seconds via dashboard poll
                // but this chart expects per-second updates in its previous simulated version.
                // We'll just append the current backend state.
                const lastEntry = prev[prev.length - 1];
                if (lastEntry && lastEntry.time === timeStr) {
                    const updated = [...prev];
                    updated[updated.length - 1] = newEntry;
                    return updated;
                }
                return [...prev.slice(-59), newEntry];
            });
        }
    }, [isAnalyzing, backendStats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Kendaraan Kumulatif (Real-Time)</CardTitle>
        <CardDescription>
            {isAnalyzing 
                ? "Waktu Berjalan (HH:MM:SS)"
                : "Mulai analisis untuk melihat data."
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis label={{ value: 'Total Kumulatif', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="total" name="Total Kumulatif" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="mendekat" name="Mendekat Kumulatif" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="menjauh" name="Menjauh Kumulatif" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
