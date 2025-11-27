'use client';

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';

const generateMovingAverageData = () => {
  const data = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const mendekat = Math.random() * 0.5 + 0.2;
    const menjauh = Math.random() * 0.4 + 0.1;
    data.push({
      name: `${String(hour.getHours()).padStart(2, '0')}:00`,
      pcuMendekat: mendekat,
      pcuMenjauh: menjauh,
      pcuTotal: mendekat + menjauh,
    });
  }
  return data;
};

interface MovingAverageChartProps {
  isAnalyzing: boolean;
}

export function MovingAverageChart({ isAnalyzing }: MovingAverageChartProps) {
  const [chartData, setChartData] = useState(generateMovingAverageData());

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setChartData(generateMovingAverageData());
      }, 5000); // Update data every 5 seconds
    } else {
        setChartData([]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisis Rerata Bergerak (SKR / Jam Bergulir)</CardTitle>
        <CardDescription>
            {isAnalyzing
            ? "Analisis SKR (Satuan Kendaraan Roda Empat) per jam."
            : "Mulai analisis untuk melihat data."
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              label={{
                value: 'Volume (SKR/Jam)',
                angle: -90,
                position: 'insideLeft',
                fill: 'hsl(var(--muted-foreground))',
              }}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 1.0]}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            <Bar
              dataKey="pcuMendekat"
              name="SKR Mendekat"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="pcuMenjauh"
              name="SKR Menjauh"
              fill="hsl(var(--chart-4))"
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="pcuTotal"
              name="Total SKR"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
