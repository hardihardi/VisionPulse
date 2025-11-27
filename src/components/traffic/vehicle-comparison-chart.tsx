"use client"

import { useMemo, useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialChartData = [
    { name: '08-09' }, { name: '09-10' }, { name: '10-11' },
    { name: '11-12' }, { name: '12-13' }, { name: '13-14' },
];

const vehicleTypes = {
  'SM': 'Sepeda Motor (SM)',
  'MP': 'Mobil Penumpang (MP)',
  'KS': 'Kendaraan Sedang (KS)',
  'BB': 'Bus Besar (BB)',
  'TB': 'Truk Barang (TB)',
};

type VehicleTypeKey = keyof typeof vehicleTypes | 'Semua';

const generateRandomData = () => {
    return initialChartData.map(item => {
        const normalData: { [key in VehicleTypeKey]: number } = { 'Semua': 0, 'SM': 0, 'MP': 0, 'KS': 0, 'BB': 0, 'TB': 0 };
        const oppositeData: { [key in VehicleTypeKey]: number } = { 'Semua': 0, 'SM': 0, 'MP': 0, 'KS': 0, 'BB': 0, 'TB': 0 };
        
        let normalTotal = 0;
        let oppositeTotal = 0;

        Object.keys(vehicleTypes).forEach(key => {
            const normalVal = Math.floor(Math.random() * 200) + 20;
            const oppositeVal = Math.floor(Math.random() * 200) + 20;
            normalData[key as keyof typeof vehicleTypes] = normalVal;
            oppositeData[key as keyof typeof vehicleTypes] = oppositeVal;
            normalTotal += normalVal;
            oppositeTotal += oppositeVal;
        });

        normalData['Semua'] = normalTotal;
        oppositeData['Semua'] = oppositeTotal;
        
        return {
            ...item,
            Normal: normalData,
            Opposite: oppositeData,
        };
    });
};

type DirectionFilterType = 'Semua' | 'Normal' | 'Opposite';

export function VehicleComparisonChart() {
  const [rawData, setRawData] = useState(generateRandomData());
  const [directionFilter, setDirectionFilter] = useState<DirectionFilterType>('Semua');
  const [vehicleFilter, setVehicleFilter] = useState<VehicleTypeKey>('Semua');

  useEffect(() => {
    const interval = setInterval(() => {
      setRawData(generateRandomData());
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    return rawData.map(item => ({
      name: item.name,
      Normal: item.Normal[vehicleFilter],
      Opposite: item.Opposite[vehicleFilter],
    }));
  }, [rawData, vehicleFilter]);
  
  const vehicleTypeLabel = vehicleFilter === 'Semua' ? 'Semua Kendaraan' : vehicleTypes[vehicleFilter as keyof typeof vehicleTypes];

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <CardTitle>Perbandingan Volume Kendaraan (kend./jam)</CardTitle>
          <CardDescription>Perbandingan volume lalu lintas untuk: <strong>{vehicleTypeLabel}</strong></CardDescription>
        </div>
        <div className="flex flex-col gap-2 items-start sm:items-end">
            <div className="flex items-center gap-1 rounded-md bg-muted p-1 self-start">
                {(['Semua', 'Normal', 'Opposite'] as DirectionFilterType[]).map((f) => (
                  <Button
                    key={f}
                    variant={directionFilter === f ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDirectionFilter(f)}
                    className={cn("capitalize px-2 sm:px-3", directionFilter === f && "bg-background shadow-sm hover:bg-background text-foreground")}
                  >
                    {f}
                  </Button>
                ))}
            </div>
            <Select onValueChange={(value) => setVehicleFilter(value as VehicleTypeKey)} defaultValue="Semua">
                <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Pilih Jenis Kendaraan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Semua">Semua Kendaraan</SelectItem>
                    {Object.entries(vehicleTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
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
            {(directionFilter === 'Semua' || directionFilter === 'Normal') && (
                <Bar dataKey="Normal" name="Arah Normal" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            )}
            {(directionFilter === 'Semua' || directionFilter === 'Opposite') && (
                <Bar dataKey="Opposite" name="Arah Opposite" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
