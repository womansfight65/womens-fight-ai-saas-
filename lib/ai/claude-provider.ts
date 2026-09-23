import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import { env } from '@/lib/config/env';
import { AIProviderError, type AICompleteOptions, type AIProvider, type AIResult } from './provider';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: env.claudeApiKey });
  return client;
}

/** The production AI brain: Claude, with structured JSON output. */
export class ClaudeProvider implements AIProvider {
  readonly id = 'claude';
  readonly label = 'Claude';
  readonly isMock = false;
  readonly model = env.claudeModel;

  async complete(options: AICompleteOptions): Promise<AIResult> {
    const system = options.json
      ? `${options.system}\n\nReturn only the JSON document. No preamble, no markdown fences, no commentary.`
      : options.system;

    try {
      const response = await getClient().messages.create({
        model: this.model,
        max_tokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? (options.json ? 0.6 : 0.8),
        system,
        messages: options.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();

      if (!text) throw new AIProviderError('The AI returned an empty response.');

      return {
        text,
        provider: this.id,
        model: this.model,
        isMock: false,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      const message =
        error instanceof Error ? error.message : 'The AI request failed for an unknown reason.';
      throw new AIProviderError(message, error);
    }
  }
}
