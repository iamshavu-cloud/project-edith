import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
          {
            'bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/20 border border-indigo-400/20': variant === 'primary',
            'bg-bg-elevated border border-border text-text-primary hover:border-border-strong hover:bg-bg-card': variant === 'secondary',
            'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated': variant === 'ghost',
            'bg-status-danger-bg border border-status-danger/30 text-status-danger hover:bg-red-950/80 shadow-sm shadow-red-500/10': variant === 'danger',
            'bg-transparent border border-border text-text-secondary hover:text-text-primary hover:border-accent/40': variant === 'outline',
            'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold shadow-lg shadow-indigo-500/25': variant === 'gradient',
          },
          {
            'text-xs px-3 py-1.5': size === 'sm',
            'text-sm px-4 py-2.5': size === 'md',
            'text-base px-6 py-3.5': size === 'lg',
            'p-2.5': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
