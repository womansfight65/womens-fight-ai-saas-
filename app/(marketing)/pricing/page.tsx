import type { Metadata } from 'next';

import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { FinalCta } from '@/components/marketing/final-cta';
import { PricingTable } from '@/components/marketing/pricing-table';
import { integrations } from '@/lib/config/env';
import { SectionHeading } from '@/components/marketing/section-heading';
import { PLANS } from '@/lib/config/plans';

const LIMIT_ROWS = [
  { label: 'Workspaces', key: 'workspaces' },
  { label: 'Content plans per month', key: 'content_plans_per_month' },
  { label: 'AI generations per month', key: 'ai_generations_per_month' },
  { label: 'Image generations per month', key: 'image_generations_per_month' },
  { label: 'Video generations per month', key: 'video_generations_per_month' },
  { label: 'Connected platforms', key: 'connected_platforms' },
  { label: 'Scheduled posts per month', key: 'scheduled_posts_per_month' },
  { label: 'Team members', key: 'team_members' },
] as const;

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free, Pro and Business plans for Woman’s Fight AI.',
};

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-soft py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans, honest limits"
            description="Every plan includes the whole workflow. What changes is how much you run through it each month."
          />
          <div className="mt-12">
            <PricingTable paymentsConnected={integrations.billing} />
          </div>
        </div>
      </section>

      <section className="wf-section">
        <div className="container">
          <SectionHeading title="Compare the limits" align="center" />
          <div className="mt-10 overflow-hidden rounded-4xl border border-line bg-white shadow-soft">
            <div className="wf-scroll overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-soft text-2xs uppercase tracking-[0.12em] text-ink-faint">
                    <th scope="col" className="px-6 py-4 font-semibold">Limit</th>
                    {PLANS.map((plan) => (
                      <th key={plan.id} scope="col" className="px-6 py-4 font-semibold text-ink">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LIMIT_ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-line/70 last:border-0">
                      <th scope="row" className="px-6 py-4 text-sm font-medium text-ink-soft">
                        {row.label}
                      </th>
                      {PLANS.map((plan) => {
                        const value = plan.limits[row.key];
                        return (
                          <td key={plan.id} className="px-6 py-4 text-sm text-ink">
                            {value >= 999 ? 'Unlimited' : value === 0 ? '—' : value.toLocaleString()}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="wf-section border-t border-line bg-surface-soft">
        <div className="container">
          <SectionHeading title="Pricing questions" />
          <div className="mt-10">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
