
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { PcuCoefficients } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Settings2 } from 'lucide-react';

interface PcuCoefficientProps {
    coefficients: PcuCoefficients;
    onUpdate: (newCoefficients: PcuCoefficients) => void;
    lineY?: number;
    onLineYChange?: (val: number) => void;
}

const vehicleTypes: { id: keyof PcuCoefficients, label: string }[] = [
    { id: 'sepedaMotor', label: 'Motor' },
    { id: 'mobil', label: 'Mobil' },
    { id: 'bus', label: 'Bus' },
    { id: 'truk', label: 'Truk' },
    { id: 'trailer', label: 'Trailer' },
];

export function PcuCoefficient({ coefficients, onUpdate, lineY = 0.5, onLineYChange }: PcuCoefficientProps) {
    const { toast } = useToast();
    const [localLineY, setLocalLineY] = useState(lineY);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newCoefficients: PcuCoefficients = { ...coefficients };
        
        let hasChanged = false;
        for (const vehicle of vehicleTypes) {
            const value = formData.get(vehicle.id);
            if (value !== null) {
                const numericValue = parseFloat(value as string);
                if (!isNaN(numericValue) && newCoefficients[vehicle.id] !== numericValue) {
                    newCoefficients[vehicle.id] = numericValue;
                    hasChanged = true;
                }
            }
        }
        
        if (hasChanged) {
            onUpdate(newCoefficients);
            toast({
                title: "Koefisien SKR Diperbarui",
                description: "Nilai koefisien SKR telah berhasil diperbarui.",
            });
        }
    };

    const handleLineYCommit = (vals: number[]) => {
        if (onLineYChange) {
            onLineYChange(vals[0]);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Konfigurasi Sistem
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs">Posisi Garis Hitung (ROI)</Label>
                        <span className="text-[10px] font-mono bg-muted px-1 rounded">{localLineY.toFixed(2)}</span>
                    </div>
                    <Slider
                        value={[localLineY]}
                        min={0.1}
                        max={0.9}
                        step={0.01}
                        onValueChange={(vals) => setLocalLineY(vals[0])}
                        onValueCommit={handleLineYCommit}
                    />
                    <p className="text-[10px] text-muted-foreground italic">Geser untuk mengubah posisi garis deteksi secara real-time.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                    <Label className="text-xs font-semibold">Koefisien SKR</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {vehicleTypes.map(vehicle => (
                            <div key={vehicle.id} className="space-y-1">
                                <Label htmlFor={vehicle.id} className="text-[10px] text-muted-foreground">{vehicle.label}</Label>
                                <Input 
                                    id={vehicle.id} 
                                    name={vehicle.id}
                                    type="number" 
                                    step="0.01"
                                    className="h-8 text-xs"
                                    defaultValue={coefficients[vehicle.id]} 
                                />
                            </div>
                        ))}
                    </div>
                    <Button type="submit" size="sm" className="w-full text-xs">Simpan Koefisien</Button>
                </form>
            </CardContent>
        </Card>
    );
}
