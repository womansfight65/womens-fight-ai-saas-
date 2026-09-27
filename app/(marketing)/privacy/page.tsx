import type { Metadata } from 'next';

import { SectionHeading } from '@/components/marketing/section-heading';
import { site } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${site.name} collects, uses and protects your data.`,
};

export default function PrivacyPage() {
  return (
    <section className="wf-section">
      <div className="container">
        <SectionHeading eyebrow="Privacy" title="Privacy Policy" align="left" />

        <div className="prose-wf mx-auto mt-10 max-w-3xl space-y-8 text-base leading-relaxed text-ink-soft">
          <p className="text-sm text-ink-faint">Last updated: {new Date().toISOString().slice(0, 10)}</p>

          <p>
            This policy explains what {site.name} (&quot;we&quot;, &quot;our&quot;, &quot;the service&quot;) collects when you use the
            product, why, and what control you have over it. It applies to the web application and its
            connected integrations.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-ink">1. What we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Account information:</strong> your name, email address, and authentication details,
                collected when you sign up (directly or via Google sign-in).
              </li>
              <li>
                <strong>Business profile data:</strong> information you provide about your business, brand
                voice, audience and goals, used to generate content on your behalf.
              </li>
              <li>
                <strong>Content you create:</strong> conversations with the AI assistant, generated posts,
                and any edits you make to them.
              </li>
              <li>
                <strong>Connected social accounts:</strong> when you connect a platform (e.g. Facebook,
                Instagram, TikTok), we store the minimum account identifiers and access tokens required to
                publish content you approve. These tokens are stored server-side and are never exposed to
                your browser or to other users.
              </li>
              <li>
                <strong>Usage data:</strong> basic technical logs (timestamps, error events) used to keep the
                service reliable.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">2. How we use it</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>To generate content tailored to your business through the Claude AI API.</li>
              <li>To publish content to social platforms, but only after you explicitly approve a post.</li>
              <li>To operate, maintain, and improve the service (e.g. diagnosing errors).</li>
              <li>To communicate with you about your account or the service.</li>
            </ul>
            <p className="mt-3">We do not sell your data, and we do not use it to train third-party models.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">3. Third parties we share data with</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Supabase</strong> — hosts our database and handles authentication.
              </li>
              <li>
                <strong>Anthropic (Claude API)</strong> — processes the text you and the AI exchange in order
                to generate content.
              </li>
              <li>
                <strong>Meta (Facebook/Instagram Graph API) and TikTok</strong> — only when you connect an
                account, and only to publish the specific posts you approve, or to read the minimum account
                information (e.g. Page name, Instagram username) needed to show you what is connected.
              </li>
            </ul>
            <p className="mt-3">
              We do not share your data with any other third party, and never for advertising purposes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">4. Your controls</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Disconnect any social account at any time from the Social Accounts page.</li>
              <li>Request a copy or deletion of your data by contacting us (below).</li>
              <li>Delete your account, which removes your profile, content and connected-account tokens.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">5. Data retention</h2>
            <p className="mt-3">
              We retain your data for as long as your account is active. When you delete your account or
              disconnect a platform, the associated tokens and identifiers are deleted from our database.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">6. Contact</h2>
            <p className="mt-3">
              Questions about this policy or your data can be sent to{' '}
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
