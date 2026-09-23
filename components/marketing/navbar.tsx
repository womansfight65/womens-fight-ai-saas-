'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils/cn';
import { marketingNav } from '@/lib/config/site';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300 ease-premium',
        scrolled ? 'border-line bg-white/85 backdrop-blur-xl' : 'border-transparent bg-white/60 backdrop-blur-sm',
      )}
    >
      <nav className="container flex h-[72px] items-center justify-between gap-6" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup" size="sm">
            Sign up
          </ButtonLink>
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-ink transition-colors hover:bg-surface-muted lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-white lg:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <ButtonLink href="/login" variant="outline" fullWidth>
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" fullWidth>
                Sign up
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
