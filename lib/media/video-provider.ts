import { integrations } from '@/lib/config/env';

export interface VideoScene {
  index: number;
  visual: string;
  voiceover: string;
  durationSeconds: number;
}

export interface VideoRequest {
  script: string;
  scenes: VideoScene[];
  aspectRatio: '9:16' | '1:1' | '16:9';
  voice?: string;
  music?: string;
}

export type VideoResult =
  | { ok: true; url: string; provider: string }
  | { ok: false; error: string; provider: string };

/**
 * Video generation interface. The pipeline is script -> scene plan -> visuals
 * -> voice -> music -> render, and each stage belongs to the provider, so the
 * app never hard-codes one vendor's model of a video.
 */
export interface VideoProvider {
  readonly id: string;
  readonly label: string;
  readonly isConfigured: boolean;
  generate(request: VideoRequest): Promise<VideoResult>;
}

export class UnconfiguredVideoProvider implements VideoProvider {
  readonly id = 'unconfigured';
  readonly label = 'Not connected';
  readonly isConfigured = false;

  async generate(): Promise<VideoResult> {
    return {
      ok: false,
      provider: this.id,
      error: 'Video generation is a future phase. No video provider is connected yet.',
    };
  }
}

export function getVideoProvider(): VideoProvider {
  return new UnconfiguredVideoProvider();
}

export const videoGenerationAvailable = integrations.videoGeneration;
