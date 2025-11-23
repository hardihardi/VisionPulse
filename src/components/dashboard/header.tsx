import { ThemeToggle } from '@/components/layout/theme-toggle';

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Sistem Penghitungan Lalu Lintas Real-Time</h1>
        <p className="text-muted-foreground">Analisis PCU dan Moving Average (15 Menit & 1 Jam Bergulir)</p>
      </div>
      <ThemeToggle />
    </header>
  );
}
