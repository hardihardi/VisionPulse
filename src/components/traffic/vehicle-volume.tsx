"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VehicleCounter = ({ title, counts }: { title: string, counts: { [key: string]: number } }) => (
  <div className="p-4 bg-muted/50 rounded-lg">
    <h4 className="font-semibold text-center mb-2">{title}</h4>
    <div className="text-center text-3xl font-bold mb-2">
      {Object.values(counts).reduce((a, b) => a + b, 0)}
    </div>
    <div className="space-y-1 text-sm text-muted-foreground">
      {Object.entries(counts).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span>{key}:</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  </div>
);


export function VehicleVolume() {
    const [mendekat, setMendekat] = useState({ Motor: 0, Mobil: 0, Bus: 0, Truk: 0 });
    const [menjauh, setMenjauh] = useState({ Motor: 0, Mobil: 0, Bus: 0, Truk: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setMendekat(prev => ({
                Motor: prev.Motor + Math.floor(Math.random() * 2),
                Mobil: prev.Mobil + Math.floor(Math.random() * 3),
                Bus: prev.Bus + (Math.random() > 0.8 ? 1 : 0),
                Truk: prev.Truk + (Math.random() > 0.9 ? 1 : 0),
            }));
            setMenjauh(prev => ({
                Motor: prev.Motor + Math.floor(Math.random() * 2),
                Mobil: prev.Mobil + Math.floor(Math.random() * 3),
                Bus: prev.Bus + (Math.random() > 0.85 ? 1 : 0),
                Truk: prev.Truk + (Math.random() > 0.92 ? 1 : 0),
            }));
        }, 3000); // update every 3 seconds
        return () => clearInterval(interval);
    }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Kendaraan (Kumulatif)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <VehicleCounter title="Mendekat:" counts={mendekat} />
        <VehicleCounter title="Menjauh:" counts={menjauh} />
      </CardContent>
    </Card>
  );
}
