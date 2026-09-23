import { Sparkles } from 'lucide-react';

import { SectionHeading } from './section-heading';

export function CreatePreview() {
  return (
    <section className="wf-section border-t border-line bg-surface-soft">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <SectionHeading
            align="left"
            eyebrow="Create with AI"
            title="Ask for a post the way you would ask a colleague"
            description="Type it however it comes out of your head. The assistant already knows your business, so a single line is enough."
          />

          <div className="wf-card overflow-hidden">
            <div className="border-b border-line bg-white px-5 py-4">
              <p className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink">
                amar jewellery business er jonno ekta Eid promotional post dao
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-purple">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Generated
              </div>

              <dl className="space-y-3.5 text-sm">
                {[
                  ['Hook', 'Eid er shopping list e ekta jinis baki ache.'],
                  ['Caption', 'Notun collection ese geche — hater kaj, halka weight, sob dress er sathe cholbe. Eid er ager shesh delivery date 5 tarikh.'],
                  ['CTA', 'Inbox korun, stock confirm kore debo.'],
                  ['Hashtags', '#eidcollection #jewellerybd #handmade'],
                  ['Image concept', 'Two earrings on warm linen, soft window light, one gold accent.'],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[92px_1fr] gap-3">
                    <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">{label}</dt>
                    <dd className="text-ink">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                {['Edit', 'Regenerate', 'Save draft', 'Approve', 'Schedule'].map((action, index) => (
                  <span
                    key={action}
                    className={
                      index === 3
                        ? 'rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-medium text-white'
                        : 'rounded-full border border-line-strong px-3.5 py-1.5 text-xs font-medium text-ink-soft'
                    }
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
