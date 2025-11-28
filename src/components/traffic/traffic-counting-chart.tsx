
"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

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
    chartData: any[];
}

export function TrafficCountingChart({ isAnalyzing, chartData }: TrafficCountingChartProps) {
    const isMobile = useIsMobile();
    
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
