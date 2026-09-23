import type { Metadata } from 'next';

import { AIWorkflow } from '@/components/marketing/ai-workflow';
import { AutomationSection } from '@/components/marketing/automation-section';
import { CreatePreview } from '@/components/marketing/create-preview';
import { FeaturesGrid } from '@/components/marketing/features-grid';
import { FinalCta } from '@/components/marketing/final-cta';
import { MediaPreview } from '@/components/marketing/media-preview';
import { PlanPreview } from '@/components/marketing/plan-preview';
import { PlatformsSection } from '@/components/marketing/platforms-section';
import { SectionHeading } from '@/components/marketing/section-heading';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Business Brain, 30-day planning, per-platform writing, approval-first automation and server-side scheduling.',
};

export default function FeaturesPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-soft py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Features"
            title="What WF Autopost AI actually does"
            description="One conversation about your business, then a month of content that holds together."
          />
        </div>
      </section>

      <FeaturesGrid />
      <AIWorkflow />
      <PlanPreview />
      <CreatePreview />
      <MediaPreview />
      <PlatformsSection />
      <AutomationSection />
      <FinalCta />
    </>
  );
}
