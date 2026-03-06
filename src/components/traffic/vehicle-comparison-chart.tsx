
"use client"

import { useMemo, useState, useEffect, forwardRef } from 'react';
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

const vehicleTypes = {
  'SepedaMotor': 'Sepeda Motor',
  'Mobil': 'Mobil',
  'Bus': 'Bus',
  'Truk': 'Truk',
  'Trailer': 'Trailer'
};

const mapping: any = {
    'SepedaMotor': 'motorcycle',
    'Mobil': 'car',
    'Bus': 'bus',
    'Truk': 'truck',
    'Trailer': 'trailer'
};

type VehicleTypeKey = keyof typeof vehicleTypes | 'Semua';

type DirectionFilterType = 'Semua' | 'Normal' | 'Opposite';

interface VehicleComparisonChartProps {
  isAnalyzing: boolean;
  backendStats?: any;
}

export const VehicleComparisonChart = forwardRef<HTMLDivElement, VehicleComparisonChartProps>(
  ({ isAnalyzing, backendStats }, ref) => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [directionFilter, setDirectionFilter] = useState<DirectionFilterType>('Semua');
    const [vehicleFilter, setVehicleFilter] = useState<VehicleTypeKey>('Semua');

    useEffect(() => {
        if (!isAnalyzing) {
            setChartData([]);
            return;
        }

        if (backendStats && backendStats.counts) {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const getVal = (direction: 'Mendekat' | 'Menjauh', vKey: VehicleTypeKey) => {
                if (vKey === 'Semua') {
                    return Object.values(backendStats.counts[direction]).reduce((a: any, b: any) => a + b, 0) as number;
                }
                return backendStats.counts[direction][mapping[vKey]] || 0;
            };

            const newEntry = {
                name: timeStr,
                Normal: getVal('Mendekat', vehicleFilter),
                Opposite: getVal('Menjauh', vehicleFilter),
            };

            setChartData(prev => {
                if (prev.length === 0) return [newEntry];
                const last = prev[prev.length - 1];
                if (last.name === timeStr) {
                    const updated = [...prev];
                    updated[updated.length - 1] = newEntry;
                    return updated;
                }
                return [...prev.slice(-5), newEntry];
            });
        }
    }, [isAnalyzing, backendStats, vehicleFilter]);
    
    const vehicleTypeLabel = vehicleFilter === 'Semua' ? 'Semua Kendaraan' : vehicleTypes[vehicleFilter as keyof typeof vehicleTypes];

    return (
      <Card ref={ref}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <CardTitle>Perbandingan Volume Kendaraan (Kumulatif)</CardTitle>
            <CardDescription>
              {isAnalyzing
                ? `Perbandingan volume kumulatif untuk: ${vehicleTypeLabel}`
                : "Mulai analisis untuk melihat data."
              }
            </CardDescription>
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
                  label={{ value: 'Waktu', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  label={{ value: 'Volume (kend.)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
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
                  <Bar dataKey="Normal" name="Mendekat" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              )}
              {(directionFilter === 'Semua' || directionFilter === 'Opposite') && (
                  <Bar dataKey="Opposite" name="Menjauh" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }
);

VehicleComparisonChart.displayName = 'VehicleComparisonChart';
