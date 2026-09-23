import { ShieldCheck } from 'lucide-react';

import { SectionHeading } from './section-heading';

const CHAIN = [
  { label: 'AI creates', tone: 'ai' },
  { label: 'You review', tone: 'you' },
  { label: 'You approve', tone: 'you' },
  { label: 'System schedules', tone: 'system' },
  { label: 'System publishes', tone: 'system' },
] as const;

export function AutomationSection() {
  return (
    <section className="wf-section">
      <div className="container">
        <div className="overflow-hidden rounded-4xl border border-line bg-white shadow-lift">
          <div className="grid gap-10 p-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14 lg:p-12">
            <SectionHeading
              align="left"
              eyebrow="Automation, with a handbrake"
              title="AI does the work. You approve."
              description="Automatic publishing without approval is how brands end up apologising. The default here is that nothing leaves the building until you have read it — and that default is enforced in the service layer, not just hidden in the UI."
            />

            <div>
              <ol className="space-y-2.5">
                {CHAIN.map((step, index) => (
                  <li key={step.label} className="flex items-center gap-3">
                    <span
                      className={
                        step.tone === 'you'
                          ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white'
                          : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-soft text-xs font-semibold text-ink-soft'
                      }
                    >
                      {index + 1}
                    </span>
                    <span
                      className={
                        step.tone === 'you'
                          ? 'flex-1 rounded-2xl border border-brand-purple/25 bg-brand-purple/5 px-4 py-3 text-sm font-medium text-ink'
                          : 'flex-1 rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink-soft'
                      }
                    >
                      {step.label}
                    </span>
                  </li>
                ))}
              </ol>

              <p className="mt-6 flex items-start gap-2.5 rounded-2xl bg-surface-soft p-4 text-sm text-ink-muted">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" aria-hidden />
                A post is only ever marked published when a platform API confirms it. No confirmation, no green tick.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
