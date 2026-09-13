import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border transition-colors',
        {
          'text-[11px] px-2.5 py-0.5': size === 'sm',
          'text-xs px-3 py-1': size === 'md',
        },
        {
          'bg-bg-elevated border-border text-text-secondary': variant === 'default',
          'bg-status-success-bg border-status-success/30 text-status-success': variant === 'success',
          'bg-status-warning-bg border-status-warning/30 text-status-warning': variant === 'warning',
          'bg-status-danger-bg border-status-danger/30 text-status-danger': variant === 'danger',
          'bg-accent/15 border-accent/30 text-accent-hover': variant === 'accent',
          'bg-bg-elevated/50 border-border/50 text-text-muted': variant === 'muted',
          'bg-transparent border-border text-text-secondary': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
