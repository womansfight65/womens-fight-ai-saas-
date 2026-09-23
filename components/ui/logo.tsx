import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils/cn';

/** The real Woman's Fight brand mark (pink-to-blue gradient artwork, supplied by the client). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-block h-9 w-[76px] shrink-0', className)}>
      <Image
        src="/brand/logo-icon.png"
        alt=""
        fill
        sizes="76px"
        className="object-contain object-left"
        priority
      />
    </span>
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
    <Link
      href={href}
      className={cn('group inline-flex items-center gap-2', className)}
      aria-label="Woman's Fight AI — home"
    >
      <LogoMark className="transition-transform duration-300 ease-premium group-hover:scale-105" />
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
