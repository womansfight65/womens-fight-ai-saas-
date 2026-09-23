import Link from 'next/link';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-premium disabled:pointer-events-none disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60 focus-visible:ring-offset-2';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-[0_10px_30px_-12px_rgba(139,92,246,0.7)] hover:shadow-[0_14px_38px_-12px_rgba(139,92,246,0.85)] hover:brightness-[1.04] active:brightness-95',
  secondary: 'bg-ink text-white hover:bg-ink-soft active:bg-ink',
  outline: 'border border-line-strong bg-white text-ink hover:border-brand-purple/45 hover:bg-surface-soft',
  ghost: 'text-ink-soft hover:bg-surface-muted hover:text-ink',
  subtle: 'bg-surface-muted text-ink hover:bg-surface-sunken',
  danger: 'bg-state-danger text-white hover:brightness-110',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-[52px] px-7 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, icon, iconRight, fullWidth, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
});

export interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export function ButtonLink({
  className,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
