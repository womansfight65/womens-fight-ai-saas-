import type { Metadata } from 'next';
import { Mail, MessageCircle, LifeBuoy } from 'lucide-react';

import { ContactForm } from '@/components/marketing/contact-form';
import { SectionHeading } from '@/components/marketing/section-heading';
import { site } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: "Get in touch with the Woman's Fight AI team.",
};

export default function ContactPage() {
  return (
    <section className="wf-section">
      <div className="container">
        <SectionHeading
          eyebrow="Contact"
          title="Tell us what you are trying to do"
          description="Questions about the product, a business that does not fit the usual mould, or a partnership — all welcome."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
          <div className="space-y-4">
            {[
              { icon: Mail, title: 'Email', body: site.supportEmail },
              { icon: MessageCircle, title: 'Languages', body: 'Bangla, Banglish or English — whichever is easiest.' },
              { icon: LifeBuoy, title: 'Response time', body: 'We aim to reply within two working days.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 rounded-3xl border border-line bg-white p-6 shadow-soft">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-brand-purple">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
