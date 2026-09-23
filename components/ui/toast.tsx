'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  push: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // A missing provider should never crash a page; toasts are non-essential.
  return ctx ?? { push: () => undefined };
}

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, tone, message }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 5200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone];
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-lift animate-slide-in-right',
                toast.tone === 'success' && 'border-state-success/25',
                toast.tone === 'error' && 'border-state-danger/25',
                toast.tone === 'info' && 'border-line',
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  toast.tone === 'success' && 'text-state-success',
                  toast.tone === 'error' && 'text-state-danger',
                  toast.tone === 'info' && 'text-brand-purple',
                )}
              />
              <p className="flex-1 text-sm text-ink">{toast.message}</p>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setToasts((current) => current.filter((t) => t.id !== toast.id))}
                className="rounded-full p-1 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
