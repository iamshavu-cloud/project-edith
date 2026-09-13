import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  glow?: boolean;
}

export function Card({ children, className, hover = true, onClick, glow }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-bg-card border border-border rounded-2xl p-5 relative overflow-hidden',
        hover && 'card-hover',
        glow && 'glow-accent',
        onClick && 'cursor-pointer select-none',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-3', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-xs font-semibold uppercase tracking-wider text-text-muted', className)}>{children}</h3>;
}

export function CardValue({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-3xl font-bold tracking-tight text-text-primary', className)}>{children}</p>;
}
