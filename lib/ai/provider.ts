export type AITask = 'onboarding' | 'plan' | 'content' | 'adapt' | 'assistant' | 'content_idea' | 'idea_plan';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AICompleteOptions {
  system: string;
  messages: AIChatMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Ask the provider for a single JSON document with no prose around it. */
  json?: boolean;
  /** Hint used by the development provider to shape a useful local response. */
  task?: AITask;
  /** Arbitrary structured context the development provider can read. */
  context?: Record<string, unknown>;
}

export interface AIResult {
  text: string;
  provider: string;
  model: string;
  isMock: boolean;
  inputTokens: number;
  outputTokens: number;
}

export interface AIProvider {
  readonly id: string;
  readonly label: string;
  readonly model: string;
  readonly isMock: boolean;
  complete(options: AICompleteOptions): Promise<AIResult>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
