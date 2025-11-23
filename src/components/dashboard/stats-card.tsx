import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  variant?: 'default' | 'destructive';
}

export function StatsCard({ title, value, icon, change, variant = 'default' }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs text-muted-foreground", variant === 'destructive' && "text-destructive")}>
            {change} dari jam terakhir
          </p>
        )}
      </CardContent>
    </Card>
  );
}
