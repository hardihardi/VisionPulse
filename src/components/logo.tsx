import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Camera className="h-6 w-6 text-primary" />
      <h1 className="text-lg font-bold text-primary">VisionPulse</h1>
    </div>
  );
}
