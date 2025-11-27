
"use client"

import { useMemo, useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const initialChartData = [
    { name: '08-09', Normal: 0, Opposite: 0 },
    { name: '09-10', Normal: 0, Opposite: 0 },
    { name: '10-11', Normal: 0, Opposite: 0 },
    { name: '11-12', Normal: 0, Opposite: 0 },
    { name: '12-13', Normal: 0, Opposite: 0 },
    { name: '13-14', Normal: 0, Opposite: 0 },
];

const generateRandomData = () => {
    return initialChartData.map(item => ({
        ...item,
        Normal: Math.floor(Math.random() * 800) + 100,
        Opposite: Math.floor(Math.random() * 800) + 100,
    }));
};

export function VehicleComparisonChart() {
  const [chartData, setChartData] = useState(generateRandomData());

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(generateRandomData());
    }, 5000); // Update every 5 seconds for a real-time feel

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perbandingan Volume Kendaraan (kend./jam)</CardTitle>
        <CardDescription>Perbandingan volume lalu lintas antara arah Normal dan Opposite.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                label={{ value: 'Jam', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                label={{ value: 'Volume (kend./jam)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Bar dataKey="Normal" name="Arah Normal" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Opposite" name="Arah Opposite" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
