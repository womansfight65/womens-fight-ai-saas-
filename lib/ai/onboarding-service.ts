import 'server-only';

import { getStore } from '@/lib/data';
import { notificationService } from '@/lib/notifications/notification-service';
import { logger } from '@/lib/utils/logger';
import type { AIMessage, SupportedLanguage, UUID } from '@/types';
import { aiService } from './ai-service';
import { businessBrainService, computeCompleteness } from './business-brain-service';
import { detectLanguage } from './language';
import { onboardingSystemPrompt } from './prompts';
import { onboardingTurnSchema } from './schemas';

export interface OnboardingState {
  conversationId: UUID;
  messages: AIMessage[];
  ready: boolean;
  completeness: number;
  isMock: boolean;
}

const OPENING: Record<SupportedLanguage, string> = {
  en: "Hi! I'm your AI content assistant. Tell me about your business — what do you sell or do?",
  bn: 'হ্যালো! আমি আপনার AI কনটেন্ট অ্যাসিস্ট্যান্ট। আপনার ব্যবসা নিয়ে বলুন — আপনি কী বিক্রি করেন বা কী করেন?',
  banglish: 'Hi! Ami apnar AI content assistant. Apnar business ta niye bolun — ki sell koren ba ki kaj koren?',
};

/**
 * The conversational onboarding. No long form: the assistant asks, the user
 * answers in whatever language they like, and every turn is folded into the
 * Business Brain.
 */
class OnboardingService {
  /** Loads the existing conversation, or starts one with the opening message. */
  async start(params: {
    workspaceId: UUID;
    userId: UUID;
    language?: SupportedLanguage;
  }): Promise<OnboardingState> {
    const store = await getStore();
    let conversation = await store.findConversation(params.workspaceId, 'onboarding');

    if (!conversation) {
      conversation = await store.createConversation({
        workspace_id: params.workspaceId,
        user_id: params.userId,
        purpose: 'onboarding',
        title: 'Business onboarding',
      });
      await store.addMessage({
        conversation_id: conversation.id,
        role: 'assistant',
        content: OPENING[params.language ?? 'en'],
        language: params.language ?? 'en',
      });
    }

    const [messages, business] = await Promise.all([
      store.listMessages(conversation.id),
      store.getBusinessProfile(params.workspaceId),
    ]);

    return {
      conversationId: conversation.id,
      messages,
      ready: businessBrainService.isReady(business),
      completeness: computeCompleteness(business),
      isMock: aiService.isMock,
    };
  }

  /** Handles one user message: detect language, answer, learn. */
  async respond(params: {
    workspaceId: UUID;
    userId: UUID;
    conversationId: UUID;
    message: string;
  }): Promise<{ reply: AIMessage; ready: boolean; completeness: number; isMock: boolean }> {
    const store = await getStore();
    const detection = detectLanguage(params.message);

    await store.addMessage({
      conversation_id: params.conversationId,
      role: 'user',
      content: params.message,
      language: detection.language,
    });

    const history = await store.listMessages(params.conversationId);
    const brain = await businessBrainService.load(params.workspaceId);

    const { data, result } = await aiService.completeJSON(
      onboardingTurnSchema,
      {
        system: onboardingSystemPrompt(detection, brain),
        messages: history
          .filter((m) => m.role !== 'system')
          .slice(-16)
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        task: 'onboarding',
        maxTokens: 1500,
        context: { language: detection.language },
      },
      { workspaceId: params.workspaceId, userId: params.userId },
    );

    const business = await businessBrainService.applyExtraction(params.workspaceId, data);

    const reply = await store.addMessage({
      conversation_id: params.conversationId,
      role: 'assistant',
      content: data.reply,
      language: detection.language,
    });

    const completeness = computeCompleteness(business);
    const ready = data.ready || businessBrainService.isReady(business);

    if (ready) {
      await notificationService.notify({
        workspaceId: params.workspaceId,
        userId: params.userId,
        kind: 'business_profile_ready',
        title: 'Your Business Brain is ready',
        body: 'The assistant understands your business well enough to plan a month of content.',
        href: '/dashboard/planner',
      });
    }

    await logger.info('onboarding', 'Onboarding turn processed', {
      workspaceId: params.workspaceId,
      language: detection.language,
      completeness,
      ready,
    });

    return { reply, ready, completeness, isMock: result.isMock };
  }

  /** Marks onboarding done so dashboard guards stop redirecting here. */
  async complete(params: { workspaceId: UUID; userId: UUID }): Promise<void> {
    const store = await getStore();
    await store.updateProfile(params.userId, { onboarding_completed: true });
    await logger.info('onboarding', 'Onboarding completed', { workspaceId: params.workspaceId });
  }
}

export const onboardingService = new OnboardingService();
