
"use client"

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import type { TrafficDataPoint } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type ChartType = 'licensePlates' | 'pcu';
type TimeFrame = 'live' | '15min' | '1hour' | 'daily';


interface TrafficTrendsChartProps {
  data: TrafficDataPoint[];
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeframe: TimeFrame) => void;
}

const calculateMovingAverage = (data: number[], windowSize: number): (number | null)[] => {
  if (windowSize <= 0) return data.map(() => null);
  const result: (number | null)[] = new Array(data.length).fill(null);
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result[i] = null;
    } else {
      const window = data.slice(i - windowSize + 1, i + 1);
      const sum = window.reduce((acc, val) => acc + val, 0);
      result[i] = Math.round(sum / windowSize);
    }
  }
  return result;
};

export function TrafficTrendsChart({ data, timeFrame, onTimeFrameChange }: TrafficTrendsChartProps) {
  const activeChart: ChartType = 'licensePlates'; // Simplified to one chart type for now

  const chartData = useMemo(() => {
    // Moving average window size based on timeframe
    const maWindowSize = timeFrame === '15min' ? 3 : timeFrame === '1hour' ? 12 : 1;
    
    const licensePlateValues = data.map(d => d.licensePlates);
    const pcuValues = data.map(d => d.pcu);
    
    const licensePlateMA = calculateMovingAverage(licensePlateValues, maWindowSize);
    const pcuMA = calculateMovingAverage(pcuValues, maWindowSize);

    return data.map((d, i) => ({
      ...d,
      name: format(new Date(d.timestamp), 'HH:mm'),
      licensePlateMA: licensePlateMA[i],
      pcuMA: pcuMA[i],
    }));
  }, [data, timeFrame]);

  const renderChart = (dataKey: 'licensePlates' | 'pcu', maDataKey: 'licensePlateMA' | 'pcuMA', color: string, name: string) => (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend />
        <Bar dataKey={dataKey} fill={color} name={name} radius={[4, 4, 0, 0]} barSize={20} />
        {timeFrame !== 'live' && (
          <Line type="monotone" dataKey={maDataKey} name={`Rerata Bergerak`} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <CardTitle>Tren Lalu Lintas</CardTitle>
            <CardDescription>Jumlah plat nomor terdeteksi dari waktu ke waktu.</CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-muted p-1">
            {(['live', '15min', '1hour', 'daily'] as TimeFrame[]).map((tf) => (
              <Button
                key={tf}
                variant={timeFrame === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => onTimeFrameChange(tf)}
                className={cn("capitalize px-3", timeFrame === tf && "bg-background shadow-sm hover:bg-background text-foreground")}
              >
                {tf === 'live' && 'Live'}
                {tf === '15min' && '15 Mnt'}
                {tf === '1hour' && '1 Jam'}
                {tf === 'daily' && 'Harian'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mt-4">
          {renderChart('licensePlates', 'licensePlateMA', 'hsl(var(--chart-1))', 'Jumlah Kendaraan')}
        </div>
      </CardContent>
    </Card>
  );
}
