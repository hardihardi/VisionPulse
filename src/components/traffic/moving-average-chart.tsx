
'use client';

import {
  forwardRef,
  useState,
  useEffect
} from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


const generateMovingAverageData = () => {
  const data = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const mendekat = 0;
    const menjauh = 0;
    data.push({
      name: `${String(hour.getHours()).padStart(2, '0')}:00`,
      pcuMendekat: mendekat,
      pcuMenjauh: menjauh,
      pcuTotal: mendekat + menjauh,
    });
  }
  return data;
};

interface MovingAverageChartProps {
  isAnalyzing: boolean;
  backendStats: any;
}

export const MovingAverageChart = forwardRef<HTMLDivElement, MovingAverageChartProps>(
  ({ isAnalyzing, backendStats }, ref) => {
    const [chartData, setChartData] = useState(generateMovingAverageData());

    useEffect(() => {
        if (!isAnalyzing) {
            setChartData([]);
            return;
        }

        if (backendStats && backendStats.moving_average_skr) {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const newEntry = {
                name: timeStr,
                pcuMendekat: backendStats.moving_average_skr.Mendekat,
                pcuMenjauh: backendStats.moving_average_skr.Menjauh,
                pcuTotal: backendStats.moving_average_skr.Mendekat + backendStats.moving_average_skr.Menjauh,
            };

            setChartData(prev => {
                if (prev.length === 0) return [newEntry];
                // Update last entry if same minute, or append
                if (prev[prev.length - 1].name === timeStr) {
                    const updated = [...prev];
                    updated[updated.length - 1] = newEntry;
                    return updated;
                }
                return [...prev.slice(-11), newEntry];
            });
        }
    }, [isAnalyzing, backendStats]);

    return (
      <Card ref={ref}>
        <CardHeader>
          <CardTitle>Analisis Rerata Bergerak (SKR / Jam Bergulir)</CardTitle>
          <CardDescription>
              {isAnalyzing
              ? "Analisis SKR (Satuan Kendaraan Roda Empat) per jam."
              : "Mulai analisis untuk melihat data."
              }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                label={{
                  value: 'Volume (SKR/Jam)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'hsl(var(--muted-foreground))',
                }}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
              <Bar
                dataKey="pcuMendekat"
                name="SKR Mendekat"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pcuMenjauh"
                name="SKR Menjauh"
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="pcuTotal"
                name="Total SKR"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }
);

MovingAverageChart.displayName = 'MovingAverageChart';
