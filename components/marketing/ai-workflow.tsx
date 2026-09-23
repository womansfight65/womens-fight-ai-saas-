import { ArrowDown } from 'lucide-react';

import { AI_WORKFLOW } from '@/lib/config/marketing';
import { SectionHeading } from './section-heading';

export function AIWorkflow() {
  return (
    <section className="wf-section">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
          <SectionHeading
            align="left"
            eyebrow="The AI workflow"
            title="One pipeline, from a sentence about your shop to a month on the calendar"
            description="Each stage is a separate service with its own job. That is why the output stays consistent and why a new capability — images, video, a new platform — slots in without rewriting the product."
          />

          <ol className="relative space-y-3">
            <span
              aria-hidden
              className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-brand-pink/40 via-brand-purple/40 to-brand-blue/40"
            />
            {AI_WORKFLOW.map((stage, index) => (
              <li key={stage.label} className="relative flex items-start gap-4 pl-0">
                <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-2xs font-semibold text-ink-soft shadow-soft">
                  {index + 1}
                </span>
                <div className="flex-1 rounded-2xl border border-line bg-white px-5 py-4 shadow-soft">
                  <p className="text-sm font-semibold text-ink">{stage.label}</p>
                  <p className="mt-1 text-sm text-ink-muted">{stage.detail}</p>
                </div>
                {index === AI_WORKFLOW.length - 1 ? null : (
                  <ArrowDown className="sr-only" aria-hidden />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
