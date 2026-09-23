import type { Metadata } from 'next';

import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { FinalCta } from '@/components/marketing/final-cta';
import { SectionHeading } from '@/components/marketing/section-heading';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers about languages, approval, scheduling, media generation and privacy.',
};

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-soft py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions, answered plainly"
            description="If something here is still unclear, write to us and we will answer it properly."
          />
        </div>
      </section>

      <section className="wf-section">
        <div className="container">
          <FaqAccordion />
        </div>
      </section>

      <FinalCta />
    </>
  );
}
