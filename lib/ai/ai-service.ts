import 'server-only';

import { z } from 'zod';

import { integrations } from '@/lib/config/env';
import { getStore } from '@/lib/data';
import { logger } from '@/lib/utils/logger';
import { extractJSON } from '@/lib/utils/text';
import { usageService } from '@/lib/usage/usage-service';
import { ClaudeProvider } from './claude-provider';
import { MockAIProvider } from './mock-provider';
import { AIProviderError, type AICompleteOptions, type AIProvider, type AIResult } from './provider';

let provider: AIProvider | null = null;

/** Claude when a key is configured, the labelled development provider otherwise. */
export function getAIProvider(): AIProvider {
  if (!provider) provider = integrations.claude ? new ClaudeProvider() : new MockAIProvider();
  return provider;
}

export interface AICallContext {
  workspaceId: string;
  userId?: string | null;
}

export class AIValidationError extends Error {
  constructor(
    message: string,
    readonly raw: string,
  ) {
    super(message);
    this.name = 'AIValidationError';
  }
}

/**
 * The single door every AI call goes through. It owns provider selection,
 * usage accounting, structured-output parsing and validation, so no React
 * component and no route handler ever talks to a model directly.
 */
class AIService {
  get isMock(): boolean {
    return getAIProvider().isMock;
  }

  get providerLabel(): string {
    return getAIProvider().label;
  }

  async complete(options: AICompleteOptions, ctx: AICallContext): Promise<AIResult> {
    const active = getAIProvider();
    const started = Date.now();
    try {
      const result = await active.complete(options);
      await usageService.record({
        workspaceId: ctx.workspaceId,
        userId: ctx.userId ?? null,
        metric: 'ai_request',
        quantity: 1,
        metadata: {
          task: options.task ?? 'assistant',
          provider: result.provider,
          model: result.model,
          input_tokens: result.inputTokens,
          output_tokens: result.outputTokens,
          duration_ms: Date.now() - started,
        },
      });
      return result;
    } catch (error) {
      await logger.error('ai', 'AI request failed', {
        workspaceId: ctx.workspaceId,
        task: options.task,
        message: error instanceof Error ? error.message : 'unknown',
      });
      throw error instanceof AIProviderError
        ? error
        : new AIProviderError('The AI request failed.', error);
    }
  }

  /**
   * Completes and validates a structured response. AI output is never trusted:
   * it is parsed, schema-checked and only then handed back to the caller.
   */
  async completeJSON<T>(
    schema: z.ZodType<T>,
    options: AICompleteOptions,
    ctx: AICallContext,
  ): Promise<{ data: T; result: AIResult }> {
    const result = await this.complete({ ...options, json: true }, ctx);
    const candidate = extractJSON(result.text);
    if (!candidate) {
      throw new AIValidationError('The AI did not return JSON.', result.text);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      throw new AIValidationError('The AI returned malformed JSON.', result.text);
    }

    const validated = schema.safeParse(parsed);
    if (!validated.success) {
      await logger.warn('ai', 'AI output failed validation', {
        workspaceId: ctx.workspaceId,
        task: options.task,
        issues: validated.error.issues.slice(0, 6).map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      throw new AIValidationError('The AI response did not match the expected shape.', result.text);
    }

    return { data: validated.data, result };
  }

  /** Records a note the user gave as feedback so future generations respect it. */
  async rememberFeedback(workspaceId: string, note: string): Promise<void> {
    if (!note.trim()) return;
    const store = await getStore();
    const business = await store.getBusinessProfile(workspaceId);
    if (!business) return;
    await logger.info('ai', 'Feedback recorded', { workspaceId, note: note.slice(0, 200) });
  }
}

export const aiService = new AIService();
