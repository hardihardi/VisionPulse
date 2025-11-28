
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
};

const vehicleOrder: (keyof PcuCoefficients)[] = ['mobil', 'bus', 'truk', 'sepedaMotor'];


export function VehicleVolume({ isAnalyzing, coefficients }: VehicleVolumeProps) {
    const [stats, setStats] = useState(initialStats);
    const [totals, setTotals] = useState({ totalKendaraan: 0, totalPcu: 0.0, detectionRate: 80.0 });
    const [processingTime, setProcessingTime] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        let timerInterval: NodeJS.Timeout | undefined;

        if (isAnalyzing) {
            setProcessingTime(0);
            timerInterval = setInterval(() => {
                setProcessingTime(prev => prev + 1);
            }, 1000);

            interval = setInterval(() => {
                setStats(prevStats => {
                    const newStats = { ...prevStats };
                    
                    vehicleOrder.forEach(key => {
                        const newCount = prevStats[key].count + Math.floor(Math.random() * 3);
                        newStats[key] = {
                            ...newStats[key],
                            count: newCount,
                            // Recalculate PCU with current coefficients
                            pcu: newCount * coefficients[key],
                        };
                    });

                    const totalVehiclesToday = Object.values(newStats).reduce((sum, s) => sum + s.count, 0);

                    // Update progress based on new total
                    vehicleOrder.forEach(key => {
                        newStats[key].progress = totalVehiclesToday > 0 ? (newStats[key].count / totalVehiclesToday) * 100 : 0;
                    });
                    
                    return newStats;
                });
            }, 2500);
        } else {
            setStats(initialStats);
            setTotals({ totalKendaraan: 0, totalPcu: 0.0, detectionRate: 80.0 });
            setProcessingTime(0);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timerInterval) clearInterval(timerInterval);
        };
    // Re-run effect if isAnalyzing changes, but not coefficients to avoid resetting counts.
    }, [isAnalyzing]);


    useEffect(() => {
        // This effect runs when stats or coefficients change.
        // It recalculates PCU values without resetting counts.
        const newStats = { ...stats };
        let totalKendaraan = 0;
        let totalPcu = 0;

        vehicleOrder.forEach(key => {
            newStats[key] = {
                ...newStats[key],
                pcu: newStats[key].count * coefficients[key],
            };
            totalKendaraan += newStats[key].count;
            totalPcu += newStats[key].pcu;
        });

        vehicleOrder.forEach(key => {
            newStats[key].progress = totalKendaraan > 0 ? (newStats[key].count / totalKendaraan) * 100 : 0;
        });

        setStats(newStats);
        setTotals(prevTotals => ({ ...prevTotals, totalKendaraan, totalPcu }));
    // We only want this effect to run when coefficients change, to update calculations.
    // The stats dependency is removed to avoid loops, direct calculation is sufficient.
    }, [coefficients]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }
    
    const getStatusText = () => {
        if (isAnalyzing) return 'ANALYZING';
        return 'STOPPED';
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
