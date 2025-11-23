"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

const generateMovingAverageData = () => {
    const data = [];
    const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    for (let i = 0; i < hours.length; i++) {
        const mendekat = Math.random() * 0.5 + 0.2;
        const menjauh = Math.random() * 0.4 + 0.1;
        data.push({
            name: hours[i],
            pcuMendekat: mendekat,
            pcuMenjauh: menjauh,
            pcuTotal: mendekat + menjauh
        });
    }
    return data;
}

export function MovingAverageChart() {
  const chartData = useMemo(() => generateMovingAverageData(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moving Average Analysis (PCU / Jam Bergulir)</CardTitle>
        <CardDescription>Analisis PCU per jam</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
                label={{ value: 'Volume (PCU/Jam)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 1.0]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar dataKey="pcuMendekat" name="PCU Mendekat (Bar)" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pcuMenjauh" name="PCU Menjauh (Bar)" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="pcuTotal" name="PCU Total (Line)" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
