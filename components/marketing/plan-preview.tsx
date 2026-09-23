import { Badge } from '@/components/ui/badge';
import { SectionHeading } from './section-heading';

const EXAMPLE_DAYS = [
  { day: 1, objective: 'Awareness', topic: 'Meet the people behind the shop', type: 'Reel', platform: 'Instagram' },
  { day: 2, objective: 'Education', topic: 'How to pick the right size, first time', type: 'Carousel', platform: 'Facebook' },
  { day: 3, objective: 'Engagement', topic: 'This or that: two new prints', type: 'Poll', platform: 'Instagram' },
  { day: 4, objective: 'Trust', topic: 'What happens after you place an order', type: 'Image post', platform: 'Facebook' },
  { day: 5, objective: 'Storytelling', topic: 'The order that almost did not make it', type: 'Reel', platform: 'Instagram' },
  { day: 6, objective: 'Community', topic: 'Your questions, answered', type: 'Story', platform: 'Instagram' },
  { day: 7, objective: 'Promotion', topic: 'Weekend bundle, three days only', type: 'Image post', platform: 'Facebook' },
] as const;

const TONE: Record<string, 'brand' | 'info' | 'success' | 'warning' | 'neutral'> = {
  Awareness: 'info',
  Education: 'brand',
  Engagement: 'neutral',
  Trust: 'success',
  Storytelling: 'brand',
  Community: 'neutral',
  Promotion: 'warning',
};

export function PlanPreview() {
  return (
    <section id="plan-preview" className="wf-section">
      <div className="container">
        <SectionHeading
          eyebrow="30-day content plan"
          title="A month that builds towards the ask"
          description="Every day gets a topic, an objective, a platform and a content type. Offers land in week four because weeks one to three earned them."
        />

        <div className="mt-14 overflow-hidden rounded-4xl border border-line bg-white shadow-lift">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-soft px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-ink">Example plan — first week</p>
              <p className="text-xs text-ink-muted">Illustrative. Your plan is written from your own Business Brain.</p>
            </div>
            <Badge tone="brand">7 of 30 shown</Badge>
          </div>

          <div className="wf-scroll overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-2xs uppercase tracking-[0.12em] text-ink-faint">
                  <th scope="col" className="px-6 py-3 font-semibold">Day</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Topic</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Objective</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Platform</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLE_DAYS.map((row) => (
                  <tr key={row.day} className="border-b border-line/70 last:border-0 transition-colors hover:bg-surface-soft">
                    <td className="px-6 py-4 text-sm font-semibold text-ink">{String(row.day).padStart(2, '0')}</td>
                    <td className="px-6 py-4 text-sm text-ink">{row.topic}</td>
                    <td className="px-6 py-4">
                      <Badge tone={TONE[row.objective] ?? 'neutral'}>{row.objective}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-muted">{row.type}</td>
                    <td className="px-6 py-4 text-sm text-ink-muted">{row.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
