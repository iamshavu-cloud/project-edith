'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
}

type ToastListener = (toast: ToastItem) => void;
const listeners: ToastListener[] = [];

export function toast(message: string, options?: { description?: string; type?: ToastType }) {
  const id = Math.random().toString(36).substring(2, 9);
  const t: ToastItem = {
    id,
    message,
    description: options?.description,
    type: options?.type || 'info',
  };
  listeners.forEach((fn) => fn(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: ToastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md animate-slide-up transition-all',
            {
              'bg-[#0f241a]/90 border-emerald-500/30 text-emerald-300 shadow-emerald-950/30': t.type === 'success',
              'bg-[#281313]/90 border-red-500/30 text-red-300 shadow-red-950/30': t.type === 'error',
              'bg-[#271d0e]/90 border-amber-500/30 text-amber-300 shadow-amber-950/30': t.type === 'warning',
              'bg-[#141528]/90 border-indigo-500/30 text-indigo-300 shadow-indigo-950/30': t.type === 'info',
            }
          )}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary leading-snug">{t.message}</p>
            {t.description && <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{t.description}</p>}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="text-text-muted hover:text-text-primary p-0.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
