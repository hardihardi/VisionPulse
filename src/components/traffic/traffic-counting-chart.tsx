
"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const generateTrafficCountData = () => {
    const data = [];
    const periods = ['00:00-00:15', '00:15-00:30', '00:30-00:45', '00:45-01:00'];
    
    for (const period of periods) {
        const mobilM = Math.floor(Math.random() * 20);
        const busM = Math.floor(Math.random() * 5);
        const trukM = Math.floor(Math.random() * 8);
        const motorM = Math.floor(Math.random() * 30);
        
        const mobilJ = Math.floor(Math.random() * 18);
        const busJ = Math.floor(Math.random() * 4);
        const trukJ = Math.floor(Math.random() * 7);
        const motorJ = Math.floor(Math.random() * 25);

        const entry: { [key: string]: any } = { 
            name: period,
            'Mobil (M)': mobilM,
            'Bus (M)': busM,
            'Truk (M)': trukM,
            'Sepeda Motor (M)': motorM,
            'Mobil (J)': mobilJ,
            'Bus (J)': busJ,
            'Truk (J)': trukJ,
            'Sepeda Motor (J)': motorJ,
            'Total Mendekat': mobilM + busM + trukM + motorM,
            'Total Menjauh': mobilJ + busJ + trukJ + motorJ,
        };
        
        data.push(entry);
    }
    return data;
}

const colors = {
    'Mobil (M)': 'hsl(var(--chart-1))',
    'Bus (M)': 'hsl(var(--chart-2))',
    'Truk (M)': 'hsl(var(--chart-3))',
    'Sepeda Motor (M)': 'hsl(var(--chart-4))',
    'Mobil (J)': 'hsl(var(--chart-5))',
    'Bus (J)': 'hsl(var(--chart-1))',
    'Truk (J)': 'hsl(var(--chart-2))',
    'Sepeda Motor (J)': 'hsl(var(--chart-3))',
};


interface TrafficCountingChartProps {
    isAnalyzing: boolean;
}

export function TrafficCountingChart({ isAnalyzing }: TrafficCountingChartProps) {
    const isMobile = useIsMobile();
    const [chartData, setChartData] = useState(generateTrafficCountData());

    useEffect(() => {
      let interval: NodeJS.Timeout | undefined;
      if (isAnalyzing) {
        interval = setInterval(() => {
          setChartData(generateTrafficCountData());
        }, 5000); // Update data every 5 seconds
      } else {
        setChartData([]);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isAnalyzing]);
    
    const renderDesktopChart = () => (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    label={{ value: 'Periode (15 Menit)', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <YAxis 
                    yAxisId="left" 
                    label={{ value: 'Volume (Kendaraan/15 Menit)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                />
                <Tooltip
                    contentStyle={{
                        background: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                    }}
                />
                <Legend wrapperStyle={{fontSize: "10px"}} />
                {Object.entries(colors).map(([key, value]) => (
                    <Bar key={key} yAxisId="left" dataKey={key} stackId="a" fill={value} name={key} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );

    const renderMobileChart = () => (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{
                        background: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                    }}
                />
                <Legend wrapperStyle={{fontSize: "12px"}} />
                <Bar dataKey="Total Mendekat" fill="hsl(var(--chart-1))" name="Mendekat" />
                <Bar dataKey="Total Menjauh" fill="hsl(var(--chart-4))" name="Menjauh" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Traffic Counting (Volume Kendaraan / 15 Menit)</CardTitle>
                <CardDescription>
                    {isAnalyzing
                        ? isMobile
                            ? "Total volume kendaraan mendekat dan menjauh."
                            : "Keterangan: **(M)** = Mendekat, **(J)** = Menjauh"
                        : "Mulai analisis untuk melihat data."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isMobile ? renderMobileChart() : renderDesktopChart()}
            </CardContent>
        </Card>
    );
}
