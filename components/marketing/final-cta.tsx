import { ArrowRight } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';

export function FinalCta() {
  return (
    <section className="wf-section">
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
            <p className="text-2xs font-semibold uppercase tracking-[0.22em] text-white/60">
              WF Autopost AI
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-display-sm">
              AI does the work. You approve.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-white/70">
              Start with one conversation about your business. Have a month of content ready before the
              kettle boils.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/signup" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                Start free
              </ButtonLink>
              <ButtonLink
                href="/features"
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
              >
                Explore the features
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
