import type { Metadata } from 'next';
import Link from 'next/link';

import { OnboardingChat } from '@/components/ai/onboarding-chat';
import { DevModeNotice } from '@/components/shared/dev-mode-notice';
import { Logo } from '@/components/ui/logo';
import { requireSession } from '@/lib/auth/guards';
import { onboardingService } from '@/lib/ai/onboarding-service';

export const metadata: Metadata = { title: 'Set up your Business Brain' };

export default async function OnboardingPage() {
  const session = await requireSession('/onboarding');

  const state = await onboardingService.start({
    workspaceId: session.user.workspace_id,
    userId: session.user.id,
    language: session.profile.locale,
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="container flex h-[72px] items-center justify-between">
          <Logo />
          {session.user.onboarding_completed ? (
            <Link href="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">
              Skip to dashboard
            </Link>
          ) : null}
        </div>
      </header>

      <main id="main" className="container py-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Tell me about your business
            </h1>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              A short chat, in whatever language you like. Everything the assistant writes afterwards comes
              out of this conversation.
            </p>
          </div>

          <DevModeNotice className="mb-5" />

          <OnboardingChat
            conversationId={state.conversationId}
            initialMessages={state.messages}
            initialReady={state.ready}
            initialCompleteness={state.completeness}
          />
        </div>
      </main>
    </div>
  );
}
