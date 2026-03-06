
"use client"

import { forwardRef } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const colors = {
    'Mobil (M)': 'hsl(var(--chart-1))',
    'Bus (M)': 'hsl(var(--chart-2))',
    'Truk (M)': 'hsl(var(--chart-3))',
    'Sepeda Motor (M)': 'hsl(var(--chart-4))',
    'Trailer (M)': 'hsl(var(--chart-5))',
    'Mobil (J)': 'hsl(var(--chart-1))',
    'Bus (J)': 'hsl(var(--chart-2))',
    'Truk (J)': 'hsl(var(--chart-3))',
    'Sepeda Motor (J)': 'hsl(var(--chart-4))',
    'Trailer (J)': 'hsl(var(--chart-5))',
};


interface TrafficCountingChartProps {
    isAnalyzing: boolean;
    chartData: any[];
}

export const TrafficCountingChart = forwardRef<HTMLDivElement, TrafficCountingChartProps>(
    ({ isAnalyzing, chartData }, ref) => {
    const isMobile = useIsMobile();
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg p-3 shadow-xl text-xs space-y-1">
                    <p className="font-bold border-b pb-1 mb-1">{label}</p>
                    {payload.map((p: any) => (
                        <div key={p.name} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                                <span>{p.name}</span>
                            </div>
                            <span className="font-mono font-bold">{p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderDesktopChart = () => (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickLine={false} 
                    axisLine={false} 
                />
                <YAxis 
                    yAxisId="left" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickLine={false} 
                    axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}} />
                {Object.entries(colors).map(([key, value]) => (
                    <Bar key={key} yAxisId="left" dataKey={key} stackId="a" fill={value} name={key} isAnimationActive={false} />
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
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}} />
                <Bar dataKey="Total Mendekat" fill="hsl(var(--chart-1))" name="Mendekat" isAnimationActive={false} />
                <Bar dataKey="Total Menjauh" fill="hsl(var(--chart-4))" name="Menjauh" isAnimationActive={false} />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <Card ref={ref}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Traffic Counting (Volume / Waktu)</CardTitle>
                <CardDescription className="text-xs">
                    {isAnalyzing
                        ? isMobile
                            ? "Mendekat & Menjauh."
                            : "Volume per jenis kendaraan."
                        : "Menunggu analisis..."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isMobile ? renderMobileChart() : renderDesktopChart()}
            </CardContent>
        </Card>
    );
});

TrafficCountingChart.displayName = 'TrafficCountingChart';
