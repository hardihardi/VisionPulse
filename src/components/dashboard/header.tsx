
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Skeleton } from '../ui/skeleton';

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">{title}</h1>
          {description.includes("Mendeteksi lokasi...") ? (
            <Skeleton className="h-5 w-64 mt-1" />
          ) : (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
