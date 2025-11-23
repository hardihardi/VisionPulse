"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const vehicleTypes = [
    { id: 'sepedaMotor', label: 'Sepeda Motor (Terdeteksi)', defaultValue: 0.4 },
    { id: 'mobil', label: 'Mobil (Terdeteksi)', defaultValue: 1 },
    { id: 'mediumBus', label: 'Bus Medium', defaultValue: 1 },
    { id: 'mediumTruck', label: 'Truk Medium', defaultValue: 1 },
    { id: 'bus', label: 'Bus (Terdeteksi)', defaultValue: 1.5 },
    { id: 'truk', label: 'Truk (Terdeteksi)', defaultValue: 2 },
    { id: 'trailer', label: 'Trailer', defaultValue: 2.5 },
    { id: 'trukGandeng', label: 'Truk Gandeng', defaultValue: 3 },
];

export function PcuCoefficient() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Koefisien SKR Diperbarui",
            description: "Nilai koefisien SKR (Satuan Kendaraan Roda Empat) telah berhasil diperbarui.",
        });
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
                        <Input id={vehicle.id} type="number" step="0.1" defaultValue={vehicle.defaultValue} />
                    </div>
                ))}
            </div>
            <Button type="submit" className="w-full">Perbarui Koefisien</Button>
        </form>
      </CardContent>
    </Card>
  );
}
