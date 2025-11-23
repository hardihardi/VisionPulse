"use client"

import { useState, useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TrafficDataPoint } from '@/lib/types';
import { format } from 'date-fns';

interface TrafficTrendsChartProps {
  data: TrafficDataPoint[];
}

const calculateMovingAverage = (data: number[], windowSize: number): (number | null)[] => {
  if (windowSize <= 0) return [];
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

export function TrafficTrendsChart({ data }: TrafficTrendsChartProps) {
  const [timeframe, setTimeframe] = useState<string>("15");

  const chartData = useMemo(() => {
    const windowSize = timeframe === '15' ? 3 : 12; // 3 * 5min = 15min, 12 * 5min = 60min
    const licensePlateValues = data.map(d => d.licensePlates);
    const pcuValues = data.map(d => d.pcu);
    
    const licensePlateMA = calculateMovingAverage(licensePlateValues, windowSize);
    const pcuMA = calculateMovingAverage(pcuValues, windowSize);

    return data.map((d, i) => ({
      ...d,
      name: format(new Date(d.timestamp), 'HH:mm'),
      licensePlateMA: licensePlateMA[i],
      pcuMA: pcuMA[i],
    }));
  }, [data, timeframe]);

  const renderChart = (dataKey: 'licensePlates' | 'pcu', maDataKey: 'licensePlateMA' | 'pcuMA', color: string) => (
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
        <Bar dataKey={dataKey} fill={color} name={dataKey === 'licensePlates' ? 'Jumlah Plat' : 'SKR'} radius={[4, 4, 0, 0]} barSize={20} />
        <Line type="monotone" dataKey={maDataKey} name={`Rerata Bergerak (${timeframe} min)`} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Tren Lalu Lintas</CardTitle>
            <CardDescription>Jumlah plat nomor dan nilai SKR dari waktu ke waktu.</CardDescription>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rerata Bergerak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15-min Rerata Bergerak</SelectItem>
              <SelectItem value="60">1-jam Rerata Bergerak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="plates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plates">Jumlah Plat</TabsTrigger>
            <TabsTrigger value="pcu">SKR (Satuan Kendaraan Roda Empat)</TabsTrigger>
          </TabsList>
          <TabsContent value="plates" className="mt-4">
            {renderChart('licensePlates', 'licensePlateMA', 'hsl(var(--chart-1))')}
          </TabsContent>
          <TabsContent value="pcu" className="mt-4">
            {renderChart('pcu', 'pcuMA', 'hsl(var(--chart-2))')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
