import type { Metadata } from 'next';

import { SectionHeading } from '@/components/marketing/section-heading';
import { site } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms that govern your use of ${site.name}.`,
};

export default function TermsPage() {
  return (
    <section className="wf-section">
      <div className="container">
        <SectionHeading eyebrow="Legal" title="Terms of Service" align="left" />

        <div className="prose-wf mx-auto mt-10 max-w-3xl space-y-8 text-base leading-relaxed text-ink-soft">
          <p className="text-sm text-ink-faint">Last updated: {new Date().toISOString().slice(0, 10)}</p>

          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of {site.name} (the &quot;Service&quot;).
            By creating an account or using the Service, you agree to these Terms.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-ink">1. The Service</h2>
            <p className="mt-3">
              {site.name} helps you plan, generate, and — once you connect and approve — publish social
              media content to platforms you own or manage. AI-generated drafts are suggestions; you are
              responsible for reviewing content before approving it for publication.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">2. Your account</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>You must provide accurate account information and keep your credentials secure.</li>
              <li>You are responsible for all activity that happens under your account.</li>
              <li>You must be legally permitted to manage the social accounts you connect to the Service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">3. Approval before publishing</h2>
            <p className="mt-3">
              The Service never publishes content to a connected platform without your explicit approval of
              that specific post. You remain responsible for what gets published under your accounts.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">4. Acceptable use</h2>
            <p className="mt-3">You agree not to use the Service to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Publish unlawful, fraudulent, or infringing content.</li>
              <li>Violate the terms of service of any connected platform (e.g. Facebook, Instagram, TikTok).</li>
              <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service.</li>
              <li>Use the Service to spam or mass-post misleading content.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">5. Content ownership</h2>
            <p className="mt-3">
              You own the content you create and approve through the Service. We claim no ownership over
              your business information or the posts generated for you.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">6. Third-party platforms</h2>
            <p className="mt-3">
              Publishing features depend on third-party APIs (Meta&apos;s Graph API, TikTok&apos;s Content Posting
              API, and others as they are added). Those platforms may change, restrict, or revoke access
              independently of us, and your use of them remains subject to their own terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">7. Disclaimer and limitation of liability</h2>
            <p className="mt-3">
              The Service is provided &quot;as is&quot;. AI-generated content may contain errors; you are responsible
              for reviewing it before it is published. To the extent permitted by law, we are not liable for
              indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">8. Termination</h2>
            <p className="mt-3">
              You may stop using the Service and delete your account at any time. We may suspend or
              terminate access for accounts that violate these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">9. Changes to these Terms</h2>
            <p className="mt-3">
              We may update these Terms as the Service evolves. Continued use after a change means you
              accept the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">10. Contact</h2>
            <p className="mt-3">
              Questions about these Terms can be sent to{' '}
              <a href={`mailto:${site.supportEmail}`} className="text-brand-purple underline">
                {site.supportEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
