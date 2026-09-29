import 'server-only';

import { env } from '@/lib/config/env';
import { AIProviderError, type AICompleteOptions, type AIProvider, type AIResult } from './provider';

const API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIErrorBody {
  error?: { message?: string };
}

interface OpenAIChatResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

/** The production AI brain when OpenAI is configured instead of Claude. */
export class OpenAIProvider implements AIProvider {
  readonly id = 'openai';
  readonly label = 'OpenAI';
  readonly isMock = false;
  readonly model = env.openaiModel;

  async complete(options: AICompleteOptions): Promise<AIResult> {
    const system = options.json
      ? `${options.system}\n\nReturn only the JSON document. No preamble, no markdown fences, no commentary.`
      : options.system;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: options.maxTokens ?? 4096,
          temperature: options.temperature ?? (options.json ? 0.6 : 0.8),
          ...(options.json ? { response_format: { type: 'json_object' } } : {}),
          messages: [
            { role: 'system', content: system },
            ...options.messages.map((message) => ({ role: message.role, content: message.content })),
          ],
        }),
      });

      const json = (await res.json()) as OpenAIChatResponse & OpenAIErrorBody;
      if (!res.ok) {
        throw new AIProviderError(json.error?.message ?? 'The OpenAI request failed.');
      }

      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) throw new AIProviderError('The AI returned an empty response.');

      return {
        text,
        provider: this.id,
        model: this.model,
        isMock: false,
        inputTokens: json.usage?.prompt_tokens ?? 0,
        outputTokens: json.usage?.completion_tokens ?? 0,
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      const message =
        error instanceof Error ? error.message : 'The AI request failed for an unknown reason.';
      throw new AIProviderError(message, error);
    }
  }
}
