"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

const generateTrafficCountData = () => {
    const data = [];
    const periods = ['00:00-00:15', '00:15-00:30', '00:30-00:45', '00:45-01:00'];
    const vehicleTypes = ['Mobil (M)', 'Bus (M)', 'Truk (M)', 'Sepeda Motor (M)', 'Mobil (J)', 'Bus (J)', 'Truk (J)', 'Sepeda Motor (J)'];

    for (const period of periods) {
        const entry: { [key: string]: any } = { name: period };
        entry['Total Mendekat (LINE)'] = Math.floor(Math.random() * 50) + 20;
        entry['Total Menjauh (LINE)'] = Math.floor(Math.random() * 40) + 15;
        vehicleTypes.forEach(type => {
            entry[type] = Math.floor(Math.random() * 20);
        });
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


export function TrafficCountingChart() {
    const chartData = useMemo(() => generateTrafficCountData(), []);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Traffic Counting (Volume Kendaraan / 15 Menit) - Per Jenis</CardTitle>
                <CardDescription>Keterangan: **(M)** = Mendekat, **(J)** = Menjauh</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Periode (15 Menit)', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis yAxisId="left" label={{ value: 'Volume (Kendaraan/15 Menit)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Total Kumulatif (LINE)', angle: 90, position: 'insideRight', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
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
            </CardContent>
        </Card>
    );
}
