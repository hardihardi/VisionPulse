
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  variant?: 'default' | 'destructive';
}

export function StatsCard({ title, value, icon, change, variant = 'default' }: StatsCardProps) {
  const isLoading = !value || value === '0';
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-8 w-1/2" />
        ) : (
            <div className="text-2xl font-bold">{value}</div>
        )}
        {change && (
          <p className={cn("text-xs text-muted-foreground", variant === 'destructive' && "text-destructive")}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
