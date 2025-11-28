"use client";

import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface CumulativeVolumeChartProps {
    isAnalyzing: boolean;
}

export function CumulativeVolumeChart({ isAnalyzing }: CumulativeVolumeChartProps) {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        let time = 0;

        if (isAnalyzing) {
            setChartData([]); // Reset data on start
            
            interval = setInterval(() => {
                setChartData(prevData => {
                    const lastEntry = prevData[prevData.length - 1] || { mendekat: 0, menjauh: 0 };
                    
                    const mendekat = lastEntry.mendekat + Math.random() * 2;
                    const menjauh = lastEntry.menjauh + Math.random() * 1.5;
                    time++;

                    const newData = [...prevData, {
                        time: `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`,
                        total: mendekat + menjauh,
                        mendekat: mendekat,
                        menjauh: menjauh,
                    }];

                    // Keep only the last 60 data points for performance
                    if (newData.length > 60) {
                        return newData.slice(newData.length - 60);
                    }
                    return newData;
                });
            }, 1000); // Update every second
        } else {
            setChartData([]); // Clear data when not analyzing
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAnalyzing]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Kendaraan Kumulatif (Real-Time - Per Detik)</CardTitle>
        <CardDescription>
            {isAnalyzing 
                ? "Waktu Berjalan (MM:SS)" 
                : "Mulai analisis untuk melihat data."
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis label={{ value: 'Total Kumulatif', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="total" name="Total Kendaraan Kumulatif" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="mendekat" name="Volume Mendekat Kumulatif" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="menjauh" name="Volume Menjauh Kumulatif" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
