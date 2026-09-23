import type { Metadata } from 'next';

import { FinalCta } from '@/components/marketing/final-cta';
import { SectionHeading } from '@/components/marketing/section-heading';

export const metadata: Metadata = {
  title: 'About',
  description: "Why WF Autopost AI exists and the principles it is built on.",
};

const PRINCIPLES = [
  {
    title: 'Approval before automation',
    body: 'Anything that posts on your behalf without asking is a liability. The approval step is enforced in the service layer, not bolted onto the interface.',
  },
  {
    title: 'Never claim what has not happened',
    body: 'A post is published when a platform API says it is. An integration is connected when it really is. Where something is unfinished, the product says so.',
  },
  {
    title: 'Meet people in their own language',
    body: 'Most of the businesses we build for think in Bangla and type in Banglish. Making them write in English to use an AI tool is a tax, so we removed it.',
  },
  {
    title: 'Strategy over volume',
    body: 'Thirty sales posts is not a content plan. A month should build attention, then trust, and only then ask for the order.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-soft py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="About"
            title="Built for the person who is also the marketing department"
            description="WF Autopost AI started from a simple observation: small business owners do not lack ideas, they lack the hours to turn ideas into a consistent month of posts."
          />
        </div>
      </section>

      <section className="wf-section">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-ink-soft">
            <p>
              Most social media tools assume a team. They give you an empty calendar, a scheduler and a
              blank caption box, and the hard part — deciding what to say for thirty days — stays exactly
              where it was.
            </p>
            <p>
              This product starts one step earlier. It learns the business first: what you sell, who buys
              it, what stops them, how you sound. That understanding is stored once, and everything the AI
              writes afterwards comes out of it. You stop re-explaining yourself to a prompt box.
            </p>
            <p>
              The people we built it for are entrepreneurs, women-led businesses, online and local shops,
              coaches, creators and the small agencies that serve them. Many of them think in Bangla and
              type in Banglish, so the assistant understands all of it without anyone choosing a language
              from a dropdown.
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="rounded-3xl border border-line bg-white p-7 shadow-soft">
                <h3 className="text-base font-semibold text-ink">{principle.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
