import Link from 'next/link';

import { cn } from '@/lib/utils/cn';

/**
 * Woman's Fight mark: a raised fist inside a rounded shield, drawn in the
 * brand's pink-to-blue gradient. Original artwork for this product.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} role="img" aria-label="Woman's Fight AI">
      <defs>
        <linearGradient id="wf-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="52%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="37" height="37" rx="12" fill="url(#wf-logo-gradient)" />
      <path
        d="M14 27.5v-6.2c0-.9.7-1.6 1.6-1.6h.6v-3.1c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v3.1h.7v-4.2c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v4.2h.7v-2.7c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v7.4c0 3-2.4 5.4-5.4 5.4h-2.4c-3 0-5.4-2.4-5.4-5.4Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path d="M13 13.5 16 11" stroke="white" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  className,
  href = '/',
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9 transition-transform duration-300 ease-premium group-hover:scale-105" />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
            Woman&apos;s Fight
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-purple">AI</span>
        </span>
      ) : null}
    </Link>
  );
}
