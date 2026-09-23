import { AIWorkflow } from '@/components/marketing/ai-workflow';
import { AutomationSection } from '@/components/marketing/automation-section';
import { CreatePreview } from '@/components/marketing/create-preview';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { FeaturesGrid } from '@/components/marketing/features-grid';
import { FinalCta } from '@/components/marketing/final-cta';
import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { MediaPreview } from '@/components/marketing/media-preview';
import { PlanPreview } from '@/components/marketing/plan-preview';
import { PlatformsSection } from '@/components/marketing/platforms-section';
import { PricingTable } from '@/components/marketing/pricing-table';
import { integrations } from '@/lib/config/env';
import { SectionHeading } from '@/components/marketing/section-heading';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <AIWorkflow />
      <FeaturesGrid />
      <PlanPreview />
      <CreatePreview />
      <MediaPreview />
      <PlatformsSection />
      <AutomationSection />

      <section id="pricing" className="wf-section border-t border-line bg-surface-soft">
        <div className="container">
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Grow when it earns it."
            description="Every plan includes the full workflow — the difference is how much of it you use each month."
          />
          <div className="mt-12">
            <PricingTable paymentsConnected={integrations.billing} />
          </div>
        </div>
      </section>

      <section id="faq" className="wf-section">
        <div className="container">
          <SectionHeading
            eyebrow="FAQ"
            title="The questions people actually ask"
          />
          <div className="mt-12">
            <FaqAccordion limit={6} />
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
