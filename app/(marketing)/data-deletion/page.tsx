import type { Metadata } from 'next';

import { SectionHeading } from '@/components/marketing/section-heading';
import { site } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions',
  description: `How to request deletion of your ${site.name} account data.`,
};

export default function DataDeletionPage() {
  return (
    <section className="wf-section">
      <div className="container">
        <SectionHeading eyebrow="Your data" title="Data Deletion Instructions" align="left" />

        <div className="prose-wf mx-auto mt-10 max-w-3xl space-y-8 text-base leading-relaxed text-ink-soft">
          <p className="text-sm text-ink-faint">Last updated: {new Date().toISOString().slice(0, 10)}</p>

          <p>
            {site.name} lets you connect social platform accounts (such as Facebook, Instagram, and
            TikTok) so approved posts can be published on your behalf. You can request deletion of your
            account and all data associated with it, including anything tied to a connected social
            account, at any time.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-ink">How to request deletion</h2>
            <p className="mt-3">
              Send an email to{' '}
              <a href={`mailto:${site.supportEmail}?subject=Data%20deletion%20request`} className="text-brand-purple underline">
                {site.supportEmail}
              </a>{' '}
              with the subject line &quot;Data deletion request&quot;, from the email address associated
              with your account. Include the connected platform(s) you want removed if you only want a
              specific connection deleted rather than your whole account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">What gets deleted</h2>
            <p className="mt-3">Once a request is confirmed, we delete:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Your account profile and business information.</li>
              <li>
                Access and refresh tokens for any connected social account (Facebook, Instagram, TikTok,
                and any platform added later) — this immediately revokes the connection on our side.
              </li>
              <li>Saved and draft posts generated for you.</li>
              <li>Scheduled posts that have not yet published.</li>
              <li>Analytics data collected for your account.</li>
              <li>Conversation history with the AI assistant, and any other data tied to your account.</li>
            </ul>
            <p className="mt-3">
              Deleting a connection here removes our copy of your data; it does not delete content already
              published to your social accounts, and you should also remove {site.name} from that
              platform&apos;s own connected-apps settings if you want to revoke access on their end too.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">How long it takes</h2>
            <p className="mt-3">
              We process deletion requests within a reasonable period, typically within 30 days of
              confirming your identity. You&apos;ll receive an email once the deletion is complete.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-3">
              Questions about this process can be sent to the same address:{' '}
              <a href={`mailto:${site.supportEmail}`} className="text-brand-purple underline">
                {site.supportEmail}
              </a>
              . See also our{' '}
              <a href="/privacy" className="text-brand-purple underline">
                Privacy Policy
              </a>{' '}
              for more on what we collect and why.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
