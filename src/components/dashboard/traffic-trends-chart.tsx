"use client"

import { useMemo, useState, useEffect } from 'react';
import { Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import type { TrafficDataPoint } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartData = useMemo(() => {
    const maWindowSize = timeFrame === '15min' ? 3 : timeFrame === '1hour' ? 12 : 1;
    const licensePlateValues = data.map(d => d.licensePlates);
    const licensePlateMA = calculateMovingAverage(licensePlateValues, maWindowSize);

    return data.map((d, i) => ({
      ...d,
      name: format(new Date(d.timestamp), 'HH:mm'),
      licensePlateMA: licensePlateMA[i],
    }));
  }, [data, timeFrame]);

  const renderChart = (dataKey: 'licensePlates', maDataKey: 'licensePlateMA', color: string, name: string) => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval={isMobile ? 2 : 0}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
        <Bar dataKey={dataKey} fill={color} name={name} radius={[2, 2, 0, 0]} barSize={isMobile ? 12 : 20} />
        {timeFrame !== 'live' && (
          <Line type="monotone" dataKey={maDataKey} name={`Rerata Bergerak`} stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl">Tren Lalu Lintas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Kendaraan terdeteksi dari waktu ke waktu.</CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
            {(['live', '15min', '1hour', 'daily'] as TimeFrame[]).map((tf) => (
              <Button
                key={tf}
                variant={timeFrame === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => onTimeFrameChange(tf)}
                className={cn(
                  "capitalize h-7 px-2 text-[10px] sm:text-xs",
                  timeFrame === tf && "bg-background shadow-sm hover:bg-background text-foreground"
                )}
              >
                {tf === 'live' && 'Live'}
                {tf === '15min' && '15m'}
                {tf === '1hour' && '1j'}
                {tf === 'daily' && 'Hr'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0 flex-grow">
        <div className="h-[300px] w-full">
          {renderChart('licensePlates', 'licensePlateMA', 'hsl(var(--chart-1))', 'Kendaraan')}
        </div>
      </CardContent>
    </Card>
  );
}
