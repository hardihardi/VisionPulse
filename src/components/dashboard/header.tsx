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
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger className="xl:hidden -ml-1" />
        <div>
          <h1 className="font-headline text-xl sm:text-3xl font-bold tracking-tight leading-tight">{title}</h1>
          {description.includes("Mendeteksi lokasi...") ? (
            <Skeleton className="h-5 w-48 sm:w-64 mt-1" />
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </header>
  );
}
