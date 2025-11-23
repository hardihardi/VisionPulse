"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const vehicleTypes = [
    { id: 'sepedaMotor', label: 'Sepeda Motor (Detected)', defaultValue: 0.4 },
    { id: 'mobil', label: 'Mobil (Detected)', defaultValue: 1 },
    { id: 'mediumBus', label: 'Medium Bus', defaultValue: 1 },
    { id: 'mediumTruck', label: 'Medium Truck', defaultValue: 1 },
    { id: 'bus', label: 'Bus (Detected)', defaultValue: 1.5 },
    { id: 'truk', label: 'Truk (Detected)', defaultValue: 2 },
    { id: 'trailer', label: 'Trailer', defaultValue: 2.5 },
    { id: 'trukGandeng', label: 'Truk Gandeng', defaultValue: 3 },
];

export function PcuCoefficient() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Koefisien PCU Diperbarui",
            description: "Nilai koefisien PCU telah berhasil diperbarui.",
        });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Koefisien PCU Aktif (PCU/Vehicle)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {vehicleTypes.map(vehicle => (
                    <div key={vehicle.id} className="space-y-1">
                        <Label htmlFor={vehicle.id} className="text-xs">{vehicle.label}</Label>
                        <Input id={vehicle.id} type="number" step="0.1" defaultValue={vehicle.defaultValue} />
                    </div>
                ))}
            </div>
            <Button type="submit" className="w-full">Update PCU</Button>
        </form>
      </CardContent>
    </Card>
  );
}
