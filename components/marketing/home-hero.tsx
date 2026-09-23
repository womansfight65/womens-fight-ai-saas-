import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';

const PROOF = ['বাংলা, বাংলিশ ও ইংরেজি — সব বোঝে', 'আপনার অনুমোদন ছাড়া কিছুই যায় না', 'র‍্যান্ডম পোস্ট নয়, একটা স্ট্র্যাটেজি'];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-brand-gradient-soft blur-3xl"
      />

      <div className="container relative pb-16 pt-14 sm:pt-20 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="wf-eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gradient" />
            ছোট ব্যবসার জন্য AI কনটেন্ট অটোমেশন
          </span>

          <h1 className="mt-6 text-balance text-display-sm font-semibold sm:text-display-md lg:text-display-lg">
            ৩০ দিনের কনটেন্ট।
            <br />
            <span className="wf-gradient-text">AI দিয়ে প্ল্যান করা।</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
            আপনার ব্যবসার কথা একবার বলুন — Woman&apos;s Fight AI পুরো মাসের সোশ্যাল মিডিয়া কনটেন্ট প্ল্যান,
            তৈরি ও গুছিয়ে রাখবে, আপনার রিভিউ ও অনুমোদনের জন্য।
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/signup" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
              ফ্রি শুরু করুন
            </ButtonLink>
            <ButtonLink href="#how-it-works" size="lg" variant="outline">
              কীভাবে কাজ করে দেখুন
            </ButtonLink>
          </div>

          <ul className="mt-9 flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6">
            {PROOF.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ink-soft">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-purple" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

/** A believable still of the real product: the onboarding chat next to what it produces. */
function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl animate-fade-up [animation-delay:120ms]">
      <div className="absolute -inset-6 -z-10 rounded-[2.75rem] bg-brand-gradient opacity-[0.10] blur-2xl" aria-hidden />

      <div className="wf-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line bg-surface-soft px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-3 text-xs font-medium text-ink-muted">app.womansfight.ai/dashboard</span>
        </div>

        <div className="grid gap-px bg-line lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left: the AI chat */}
          <div className="space-y-4 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">Create with AI</p>

            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-3xl rounded-br-lg bg-ink px-4 py-3 text-sm text-white" lang="bn">
                amar jewellery business er jonno ekta Eid post dao
              </p>
            </div>

            <div className="flex gap-2.5">
              <span className="mt-1 h-6 w-6 shrink-0 rounded-full bg-brand-gradient" aria-hidden />
              <p className="max-w-[85%] rounded-3xl rounded-bl-lg bg-surface-muted px-4 py-3 text-sm text-ink" lang="bn">
                হয়ে গেছে! ডান পাশে দেখুন — caption, hashtag সব রেডি।
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-ink-faint">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              আপনার Business Brain থেকে লেখা
            </div>
          </div>

          {/* Right: generated content + calendar */}
          <div className="space-y-4 bg-white p-5">
            <div className="rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-brand-purple">তৈরি হয়েছে</span>
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-2xs font-medium text-ink-soft">Instagram</span>
              </div>
              <p className="mt-3 text-sm font-medium text-ink" lang="bn">
                Eid er shopping list e ekta jinis baki ache.
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted" lang="bn">
                Notun collection ese geche — hater kaj, halka weight, sob dress er sathe cholbe...
              </p>
              <p className="mt-2 text-xs text-ink-faint">#eidcollection #jewellerybd #handmade</p>
            </div>

            <div className="rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  Content Calendar
                </span>
                <span>৩০ / ৩০</span>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-5 rounded-md"
                    style={{
                      background:
                        i % 4 === 0
                          ? 'transparent'
                          : `linear-gradient(135deg, rgba(236,72,153,${0.14 + (i % 6) * 0.05}), rgba(59,130,246,${0.12 + (i % 5) * 0.05}))`,
                    }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
