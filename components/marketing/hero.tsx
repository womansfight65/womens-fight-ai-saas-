import { ArrowRight, Check, Play } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';

const PROOF = ['Bangla, Banglish & English', 'Approval before anything posts', 'A strategy, not 30 random posts'];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand wash — the gradient appears here and then gets out of the way. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[560px] bg-brand-gradient-soft blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:64px_64px] wf-mask-fade-b opacity-60"
      />

      <div className="container relative pb-20 pt-16 sm:pt-24 lg:pb-28 lg:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="animate-fade-up">
            <span className="wf-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gradient" />
              AI content automation for small brands
            </span>

            <h1 className="mt-6 text-balance text-display-sm font-semibold sm:text-display-md lg:text-display-lg">
              30 days of content.
              <br />
              <span className="wf-gradient-text">Planned by AI.</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
              Tell Woman&apos;s Fight AI about your business once. Let AI plan, create, organise and
              prepare your social media content for the entire month.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/signup" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                Start free
              </ButtonLink>
              <ButtonLink href="#how-it-works" size="lg" variant="outline" icon={<Play className="h-4 w-4" />}>
                See how it works
              </ButtonLink>
            </div>

            <ul className="mt-9 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {PROOF.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-soft">
                  <Check className="h-4 w-4 text-brand-purple" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

/** A still, honest picture of the product: a chat turn and the plan it produces. */
function HeroPreview() {
  return (
    <div className="relative animate-fade-up [animation-delay:120ms]">
      <div className="absolute -inset-6 -z-10 rounded-[2.75rem] bg-brand-gradient opacity-[0.12] blur-2xl" aria-hidden />

      <div className="wf-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line bg-surface-soft px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-3 text-xs font-medium text-ink-muted">Onboarding</span>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex justify-end">
            <p className="max-w-[78%] rounded-3xl rounded-br-lg bg-ink px-4 py-3 text-sm text-white">
              ami online e meyeder poshak sell kori
            </p>
          </div>

          <div className="flex gap-3">
            <span className="mt-1 h-7 w-7 shrink-0 rounded-full bg-brand-gradient" aria-hidden />
            <p className="max-w-[80%] rounded-3xl rounded-bl-lg bg-surface-muted px-4 py-3 text-sm text-ink">
              Great! <span lang="bn">কারা আপনার main customers?</span>
            </p>
          </div>

          <div className="flex justify-end">
            <p className="max-w-[78%] rounded-3xl rounded-br-lg bg-ink px-4 py-3 text-sm text-white">
              mostly 20-35 age er working women
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-purple">
                Business Brain ready
              </p>
              <span className="text-xs text-ink-muted">30 / 30</span>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-1.5">
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  className="h-6 rounded-md"
                  style={{
                    background: `linear-gradient(135deg, rgba(236,72,153,${0.14 + (i % 6) * 0.05}), rgba(59,130,246,${0.12 + (i % 5) * 0.05}))`,
                  }}
                  aria-hidden
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              A balanced month: awareness, education, trust, stories — offers only where they have been earned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
