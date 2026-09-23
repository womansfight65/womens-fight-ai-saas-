import 'server-only';

import { getStore } from '@/lib/data';
import { logger } from '@/lib/utils/logger';
import type { AIMessage, SupportedLanguage, UUID } from '@/types';
import { aiService } from './ai-service';
import { businessBrainService } from './business-brain-service';
import { contentStrategyService } from './content-strategy-service';
import { detectLanguage, resolveChatReplyLanguage } from './language';
import { contentIdeaSystemPrompt } from './prompts';
import { contentIdeaTurnSchema } from './schemas';

export interface ContentIdeaState {
  conversationId: UUID;
  messages: AIMessage[];
  isMock: boolean;
}

/* This conversation always opens, and by default replies, in Bangla — see
 * resolveChatReplyLanguage for the "unless the user asks for English" rule. */
const OPENING_BN =
  'আপনার মাথায় থাকা পোস্টের আইডিয়াগুলো বলুন — নতুন অফার, ক্যাম্পেইন, যা কিছু। আমি সব মনে রাখব। যখন প্রস্তুত হবেন, শুধু বলুন কয়দিনে কতগুলো পোস্ট বানাতে হবে।';

export interface ContentIdeaTurnResult {
  reply: AIMessage;
  mode: 'chat' | 'generate';
  isMock: boolean;
  generated: { planId: UUID; count: number } | null;
}

/**
 * A conversation that only ever listens and remembers — until the user gives
 * an explicit command to create posts, at which point one turn hands off to
 * contentStrategyService.generateFromIdeas with everything said so far.
 */
class ContentIdeaService {
  async start(params: { workspaceId: UUID; userId: UUID }): Promise<ContentIdeaState> {
    const store = await getStore();
    let conversation = await store.findConversation(params.workspaceId, 'create');

    if (!conversation) {
      conversation = await store.createConversation({
        workspace_id: params.workspaceId,
        user_id: params.userId,
        purpose: 'create',
        title: 'Content ideas',
      });
      await store.addMessage({
        conversation_id: conversation.id,
        role: 'assistant',
        content: OPENING_BN,
        language: 'bn',
      });
    }

    const messages = await store.listMessages(conversation.id);
    return { conversationId: conversation.id, messages, isMock: aiService.isMock };
  }

  async respond(params: {
    workspaceId: UUID;
    userId: UUID;
    conversationId: UUID;
    message: string;
  }): Promise<ContentIdeaTurnResult> {
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

    /* Bangla by default, whatever language the user just wrote in — switches
     * to English only if they explicitly asked for it, in this or an earlier
     * message in the same conversation. */
    const replyLanguage = resolveChatReplyLanguage(
      history.filter((m) => m.role === 'user').map((m) => m.content),
    );

    const { data, result } = await aiService.completeJSON(
      contentIdeaTurnSchema,
      {
        system: contentIdeaSystemPrompt(replyLanguage, brain),
        messages: history
          .filter((m) => m.role !== 'system')
          .slice(-24)
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        task: 'content_idea',
        maxTokens: 800,
        context: { language: replyLanguage },
      },
      { workspaceId: params.workspaceId, userId: params.userId },
    );

    const reply = await store.addMessage({
      conversation_id: params.conversationId,
      role: 'assistant',
      content: data.reply,
      language: replyLanguage,
    });

    const mode: 'chat' | 'generate' = data.mode === 'generate' ? 'generate' : 'chat';
    let generated: { planId: UUID; count: number } | null = null;

    if (mode === 'generate' && data.generate) {
      /* Everything said in this conversation, in order, is the context the
       * generation prompt gets — the whole point of chatting first. */
      const ideaTranscript = history
        .filter((m) => m.role === 'user')
        .map((m) => `- ${m.content}`)
        .join('\n');

      const { plan, items } = await contentStrategyService.generateFromIdeas({
        workspaceId: params.workspaceId,
        userId: params.userId,
        days: data.generate.days,
        postsPerDay: data.generate.posts_per_day,
        platforms: data.generate.platforms ?? undefined,
        ideaTranscript,
        language: replyLanguage,
      });
      generated = { planId: plan.id, count: items.length };
    }

    await logger.info('content-idea', 'Content-idea turn processed', {
      workspaceId: params.workspaceId,
      mode,
      generated: Boolean(generated),
    });

    return { reply, mode, isMock: result.isMock, generated };
  }
}

export const contentIdeaService = new ContentIdeaService();
