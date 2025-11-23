
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { PcuCoefficients } from '@/lib/types';

interface PcuCoefficientProps {
    coefficients: PcuCoefficients;
    onUpdate: (newCoefficients: PcuCoefficients) => void;
}

const vehicleTypes: { id: keyof PcuCoefficients, label: string }[] = [
    { id: 'sepedaMotor', label: 'Sepeda Motor' },
    { id: 'mobil', label: 'Mobil/LV' },
    { id: 'bus', label: 'Bus' },
    { id: 'truk', label: 'Truk' },
];

export function PcuCoefficient({ coefficients, onUpdate }: PcuCoefficientProps) {
    const { toast } = useToast();

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Koefisien SKR Aktif (SKR/Kendaraan)</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {vehicleTypes.map(vehicle => (
                            <div key={vehicle.id} className="space-y-1">
                                <Label htmlFor={vehicle.id} className="text-xs">{vehicle.label}</Label>
                                <Input 
                                    id={vehicle.id} 
                                    name={vehicle.id}
                                    type="number" 
                                    step="0.1" 
                                    defaultValue={coefficients[vehicle.id]} 
                                />
                            </div>
                        ))}
                    </div>
                    <Button type="submit" className="w-full">Perbarui Koefisien</Button>
                </form>
            </CardContent>
        </Card>
    );
}
