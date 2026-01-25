
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { VehicleStats, PcuCoefficients } from '@/lib/types';

interface VehicleVolumeProps {
    isAnalyzing: boolean;
    coefficients: PcuCoefficients;
}

const initialStats: Record<keyof PcuCoefficients, VehicleStats> = {
    mobil: { name: 'Mobil', count: 0, pcu: 0, progress: 0 },
    bus: { name: 'Bus', count: 0, pcu: 0, progress: 0 },
    truk: { name: 'Truk', count: 0, pcu: 0, progress: 0 },
    sepedaMotor: { name: 'Sepeda Motor', count: 0, pcu: 0, progress: 0 },
    trailer: { name: 'Trailer', count: 0, pcu: 0, progress: 0 },
};

const vehicleOrder: (keyof PcuCoefficients)[] = ['mobil', 'bus', 'truk', 'sepedaMotor', 'trailer'];


export function VehicleVolume({ isAnalyzing, coefficients }: VehicleVolumeProps) {
    const [stats, setStats] = useState(initialStats);
    const [totals, setTotals] = useState({ totalKendaraan: 0, totalPcu: 0.0 });
    const [processingTime, setProcessingTime] = useState(0);

    useEffect(() => {
        let statsInterval: NodeJS.Timeout | undefined;
        let timerInterval: NodeJS.Timeout | undefined;

        if (isAnalyzing) {
            setProcessingTime(0);
            setStats(initialStats);
            setTotals({ totalKendaraan: 0, totalPcu: 0.0 });


            timerInterval = setInterval(() => {
                setProcessingTime(prev => prev + 1);
            }, 1000);

            statsInterval = setInterval(() => {
                setStats(prevStats => {
                    const newStats = { ...prevStats };
                    
                    vehicleOrder.forEach(key => {
                        newStats[key] = {
                            ...newStats[key],
                            count: newStats[key].count + Math.floor(Math.random() * 3),
                        };
                    });
                    
                    return newStats;
                });
            }, 2500);
        } else {
            setProcessingTime(0);
            setStats(initialStats);
             setTotals({ totalKendaraan: 0, totalPcu: 0.0 });
        }

        return () => {
            if (statsInterval) clearInterval(statsInterval);
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [isAnalyzing]);


    useEffect(() => {
        const newStats = { ...stats };
        let totalKendaraan = 0;
        let totalPcu = 0.0;

        vehicleOrder.forEach(key => {
            const pcuValue = newStats[key].count * coefficients[key];
            newStats[key].pcu = pcuValue;
            totalKendaraan += newStats[key].count;
            totalPcu += pcuValue;
        });

        vehicleOrder.forEach(key => {
            newStats[key].progress = totalKendaraan > 0 ? (newStats[key].count / totalKendaraan) * 100 : 0;
        });
        
        setStats(newStats);
        setTotals({ totalKendaraan, totalPcu });
    }, [stats.mobil.count, coefficients]); // Depend on a changing stat and coefficients

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }
    
    const getStatusText = () => {
        if (isAnalyzing) return 'MENGANALISIS';
        return 'DIHENTIKAN';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Real-time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-2 bg-muted rounded-md">
                        <CardDescription>Status</CardDescription>
                        <p className={`font-bold text-lg ${isAnalyzing ? 'text-green-500' : 'text-destructive'}`}>{getStatusText()}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                        <CardDescription>Total Kendaraan</CardDescription>
                        <p className="font-bold text-lg">{totals.totalKendaraan}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                        <CardDescription>Total SKR</CardDescription>
                        <p className="font-bold text-lg">{totals.totalPcu.toFixed(2)}</p>
                    </div>
                     <div className="p-2 bg-muted rounded-md">
                        <CardDescription>Waktu Proses</CardDescription>
                        <p className="font-bold text-lg">{formatTime(processingTime)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {vehicleOrder.map(key => {
                        const vehicle = stats[key];
                        return (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-medium">{vehicle.name}</h4>
                                    <span className="text-xs text-muted-foreground">SKR: {coefficients[key].toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                                    <span>{vehicle.count} Kendaraan</span>
                                    <span>{vehicle.pcu.toFixed(2)} SKR</span>
                                </div>
                                <Progress value={vehicle.progress} />
                                <p className="text-right text-xs mt-1 text-muted-foreground">{vehicle.progress.toFixed(1)}%</p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
