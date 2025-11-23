
"use client"

import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

// Generate mock data for the real-time cumulative chart
const generateCumulativeData = () => {
    const data = [];
    let mendekat = 0;
    let menjauh = 0;
    for (let i = 0; i < 60; i++) {
        mendekat += Math.random() * 2;
        menjauh += Math.random() * 1.5;
        data.push({
            time: `${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
            total: mendekat + menjauh,
            mendekat: mendekat,
            menjauh: menjauh,
        });
    }
    return data;
};


export function CumulativeVolumeChart() {

  const chartData = useMemo(() => generateCumulativeData(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Kendaraan Kumulatif (Real-Time - Per Detik)</CardTitle>
        <CardDescription>Waktu Berjalan (HH:MM:SS)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis label={{ value: 'Total Kumulatif', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
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
