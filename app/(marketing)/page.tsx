import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { HomeFeatures } from '@/components/marketing/home-features';
import { HomeFinalCta } from '@/components/marketing/home-cta';
import { HomeHero } from '@/components/marketing/home-hero';
import { HomeHowItWorks } from '@/components/marketing/home-how-it-works';
import { PricingTable } from '@/components/marketing/pricing-table';
import { integrations } from '@/lib/config/env';
import { SectionHeading } from '@/components/marketing/section-heading';

export default function LandingPage() {
  return (
    <>
      <HomeHero />
      <HomeHowItWorks />
      <HomeFeatures />

      <section id="pricing" className="wf-section border-t border-line bg-surface-soft" lang="bn">
        <div className="container">
          <SectionHeading
            eyebrow="মূল্য"
            title="ফ্রি শুরু করুন। প্রয়োজন হলে বাড়ান।"
            description="প্রতিটা প্ল্যানেই পুরো ওয়ার্কফ্লো আছে — পার্থক্য শুধু মাসে কতটা ব্যবহার করছেন তাতে।"
          />
          <div className="mt-12">
            <PricingTable paymentsConnected={integrations.billing} />
          </div>
        </div>
      </section>

      <section id="faq" className="wf-section" lang="bn">
        <div className="container">
          <SectionHeading eyebrow="প্রশ্নোত্তর" title="মানুষ যা সত্যিই জিজ্ঞেস করে" />
          <div className="mt-12">
            <FaqAccordion limit={6} />
          </div>
        </div>
      </section>

      <HomeFinalCta />
    </>
  );
}
