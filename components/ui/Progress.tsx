import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'auto';
}

export function Progress({
  value,
  className,
  barClassName,
  showLabel,
  size = 'md',
  color = 'auto',
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));

  // Determine auto color based on academic threshold (>=75 is green, >=65 is yellow, <65 is red)
  let resolvedColor = color;
  if (color === 'auto') {
    if (clamped >= 75) resolvedColor = 'success';
    else if (clamped >= 65) resolvedColor = 'warning';
    else resolvedColor = 'danger';
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('w-full bg-bg-elevated rounded-full overflow-hidden border border-border/30', {
          'h-1': size === 'xs',
          'h-1.5': size === 'sm',
          'h-2.5': size === 'md',
          'h-4': size === 'lg',
        })}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            {
              'bg-accent shadow-sm shadow-accent/50': resolvedColor === 'accent',
              'bg-status-success shadow-sm shadow-emerald-500/50': resolvedColor === 'success',
              'bg-status-warning shadow-sm shadow-amber-500/50': resolvedColor === 'warning',
              'bg-status-danger shadow-sm shadow-red-500/50': resolvedColor === 'danger',
            },
            barClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1.5 text-xs text-text-muted">
          <span>Progress</span>
          <span className="font-semibold text-text-primary">{clamped}%</span>
        </div>
      )}
    </div>
  );
}
