
import { ThemeToggle } from '@/components/layout/theme-toggle';

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <ThemeToggle />
    </header>
  );
}
