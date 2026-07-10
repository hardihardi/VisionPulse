"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { VehicleStats, PcuCoefficients } from '@/lib/types';
import { Clock, Car, Gauge, Activity } from 'lucide-react';

interface VehicleVolumeProps {
    isAnalyzing: boolean;
    coefficients: PcuCoefficients;
    backendStats: any;
}

const initialStats: Record<keyof PcuCoefficients, VehicleStats> = {
    mobil: { name: 'Mobil', count: 0, pcu: 0, progress: 0 },
    bus: { name: 'Bus', count: 0, pcu: 0, progress: 0 },
    truk: { name: 'Truk', count: 0, pcu: 0, progress: 0 },
    sepedaMotor: { name: 'Sepeda Motor', count: 0, pcu: 0, progress: 0 },
    trailer: { name: 'Trailer', count: 0, pcu: 0, progress: 0 },
};

const vehicleOrder: (keyof PcuCoefficients)[] = ['mobil', 'bus', 'truk', 'sepedaMotor', 'trailer'];


export function VehicleVolume({ isAnalyzing, coefficients, backendStats }: VehicleVolumeProps) {
    const [stats, setStats] = useState(initialStats);
    const [totals, setTotals] = useState({ totalKendaraan: 0, totalPcu: 0.0 });
    const [processingTime, setProcessingTime] = useState(0);

    useEffect(() => {
        let timerInterval: NodeJS.Timeout | undefined;

        if (isAnalyzing) {
            timerInterval = setInterval(() => {
                setProcessingTime(prev => prev + 1);
            }, 1000);
        } else {
            setProcessingTime(0);
            setStats(initialStats);
            setTotals({ totalKendaraan: 0, totalPcu: 0.0 });
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [isAnalyzing]);


    useEffect(() => {
        if (!backendStats) return;

        const newStats = { ...initialStats };
        let totalKendaraan = 0;
        let totalPcu = 0.0;

        const mapping: any = {
            mobil: 'car',
            bus: 'bus',
            truk: 'truck',
            sepedaMotor: 'motorcycle',
            trailer: 'trailer'
        };

        vehicleOrder.forEach(key => {
            const backendKey = mapping[key];
            const mCount = backendStats.counts.Mendekat[backendKey] || 0;
            const jCount = backendStats.counts.Menjauh[backendKey] || 0;
            const count = mCount + jCount;

            const pcuValue = count * coefficients[key];
            newStats[key] = {
                ...initialStats[key],
                count: count,
                pcu: pcuValue
            };
            totalKendaraan += count;
            totalPcu += pcuValue;
        });

        vehicleOrder.forEach(key => {
            newStats[key].progress = totalKendaraan > 0 ? (newStats[key].count / totalKendaraan) * 100 : 0;
        });
        
        setStats(newStats);
        setTotals({ totalKendaraan, totalPcu });
    }, [backendStats, coefficients]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }
    
    const getStatusText = () => {
        if (isAnalyzing) return 'AKTIF';
        return 'STOP';
    }

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold">Ringkasan Statistik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg border border-muted-foreground/5">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Status</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Activity className={`w-3 h-3 \${isAnalyzing ? 'text-green-500 animate-pulse' : 'text-red-500'}`} />
                            <p className={`font-black text-sm \${isAnalyzing ? 'text-green-500' : 'text-red-500'}`}>{getStatusText()}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg border border-muted-foreground/5">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Waktu</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-primary" />
                            <p className="font-black text-sm">{formatTime(processingTime)}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg border border-muted-foreground/5">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Total Unit</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Car className="w-3 h-3 text-orange-500" />
                            <p className="font-black text-sm">{totals.totalKendaraan}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded-lg border border-muted-foreground/5">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">SKR Total</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Gauge className="w-3 h-3 text-blue-500" />
                            <p className="font-black text-sm">{totals.totalPcu.toFixed(1)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    {vehicleOrder.map(key => {
                        const vehicle = stats[key];
                        if (!isAnalyzing && vehicle.count === 0) return null;
                        return (
                            <div key={key} className="group">
                                <div className="flex justify-between items-end mb-1.5">
                                    <div>
                                        <h4 className="text-xs font-bold leading-none">{vehicle.name}</h4>
                                        <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest font-medium">SKR: {coefficients[key].toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black leading-none">{vehicle.count} <span className="text-[9px] font-normal text-muted-foreground ml-0.5">unit</span></p>
                                        <p className="text-[9px] text-primary font-bold mt-1">{vehicle.pcu.toFixed(1)} SKR</p>
                                    </div>
                                </div>
                                <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <Progress value={vehicle.progress} className="h-full transition-all duration-1000" />
                                </div>
                                <p className="text-[9px] text-right mt-1 font-mono text-muted-foreground">{vehicle.progress.toFixed(1)}% dari total</p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
