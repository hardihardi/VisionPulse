
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VehicleCounter = ({ title, count }: { title: string, count: number }) => (
  <div className="p-4 bg-muted/50 rounded-lg">
    <h4 className="font-semibold text-center mb-2">{title}</h4>
    <div className="text-center text-3xl font-bold mb-2">
      {count}
    </div>
  </div>
);


export function VehicleVolume() {
    const [mendekat, setMendekat] = useState(0);
    const [menjauh, setMenjauh] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMendekat(prev => prev + Math.floor(Math.random() * 5));
            setMenjauh(prev => prev + Math.floor(Math.random() * 4));
        }, 3000); // update every 3 seconds
        return () => clearInterval(interval);
    }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Kendaraan (Kumulatif)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
            <VehicleCounter title="Mendekat" count={mendekat} />
            <VehicleCounter title="Menjauh" count={menjauh} />
        </div>
      </CardContent>
    </Card>
  );
}
