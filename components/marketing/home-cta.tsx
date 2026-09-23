import { ArrowRight } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';

export function HomeFinalCta() {
  return (
    <section className="wf-section" lang="bn">
      <div className="container">
        <div className="relative overflow-hidden rounded-4xl bg-ink px-8 py-16 text-center sm:px-14 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-pink/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-brand-blue/30 blur-3xl"
          />

          <div className="relative">
            <p className="text-2xs font-semibold uppercase tracking-[0.22em] text-white/60">WF Autopost AI</p>
            <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-display-sm">
              কাজটা করবে AI। সিদ্ধান্তটা আপনার।
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-white/70">
              আপনার ব্যবসার একটা ছোট চ্যাট দিয়ে শুরু করুন — কেটলিতে পানি ফোটার আগেই পুরো মাসের কনটেন্ট রেডি।
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/signup" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                ফ্রি শুরু করুন
              </ButtonLink>
              <ButtonLink
                href="/features"
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
              >
                সব ফিচার দেখুন
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
