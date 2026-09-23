import Link from 'next/link';

import { Logo } from '@/components/ui/logo';
import { DevModeNotice } from '@/components/shared/dev-mode-notice';

const POINTS = [
  'Understands Bangla, Banglish and English',
  'Learns your business once, then writes from it',
  'Nothing is scheduled without your approval',
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel — hidden on small screens where it would only push the form down. */}
      <aside className="relative hidden overflow-hidden bg-ink p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand-pink/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-16 h-96 w-96 rounded-full bg-brand-blue/25 blur-3xl"
        />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white">
              WF
            </span>
            <span className="font-display text-[15px] font-semibold text-white">WF Autopost AI</span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-balance text-3xl font-semibold leading-tight text-white">
            30 days of content.
            <br />
            Planned by AI.
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/45">AI does the work. You approve.</p>
      </aside>

      <main id="main" className="flex flex-col justify-center bg-white px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="mt-8 lg:mt-0">
            <DevModeNotice className="mb-6" />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
