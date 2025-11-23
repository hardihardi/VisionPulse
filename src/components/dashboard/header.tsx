import { ThemeToggle } from '@/components/layout/theme-toggle';

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">VisionPulse Dashboard</h1>
        <p className="text-muted-foreground">Real-time traffic analysis and insights</p>
      </div>
      <ThemeToggle />
    </header>
  );
}
