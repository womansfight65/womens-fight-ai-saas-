import type { ReactElement } from 'react';

import type { PlatformId } from '@/types';
import { cn } from '@/lib/utils/cn';

/** Each brand's real mark, at its real color(s) — never a generic letter badge. */
function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" aria-hidden>
      <path
        fill="#fff"
        d="M15.4 8.6h-2v-1.3c0-.6.4-.8.7-.8h1.2V4.1L13 4.1c-2.5 0-3 1.9-3 3.1v1.4H8.4v2.6H10V20h3.4v-8.8h2.3l.3-2.6Z"
      />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.1" cy="6.9" r="1.15" fill="#fff" />
    </svg>
  );
}

function YouTubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" aria-hidden>
      <path fill="#fff" d="M10 8.6 15.8 12 10 15.4V8.6Z" />
    </svg>
  );
}

function TikTokGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" aria-hidden>
      <path
        fill="#FE2C55"
        d="M15.1 3.3c.5 1.9 1.8 3.2 3.7 3.4v2.7c-1.4.1-2.7-.3-3.7-1.1v6.3c0 3-2.3 5.4-5.3 5.4S4.5 17.6 4.5 14.6c0-3 2.3-5.4 5.3-5.4.3 0 .6 0 .9.1v2.8a2.6 2.6 0 0 0-.9-.2c-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7c1.6 0 2.9-1.3 2.9-2.9V3.3h2.4Z"
      />
      <path
        fill="#fff"
        d="M14.3 3.3c.5 1.9 1.8 3.2 3.7 3.4v2.7c-1.4.1-2.7-.3-3.7-1.1v6.3c0 3-2.3 5.4-5.3 5.4-1.3 0-2.5-.5-3.4-1.3.9.4 1.9.5 2.9.2 1.4-.4 2.5-1.6 2.7-3.1V3.3h3.1Z"
      />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[46%] w-[46%]" aria-hidden>
      <path
        fill="#fff"
        d="m4 4 6.4 8.6L4.2 20h2.3l5.4-6.2 4.2 6.2H20l-6.7-9L19 4h-2.3l-5 5.7L8 4H4Z"
      />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" aria-hidden>
      <path
        fill="#fff"
        d="M6.9 8.6H4.3V19h2.6V8.6ZM5.6 4.3a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM19.7 19v-5.9c0-3.1-1.7-4.6-3.9-4.6-1.8 0-2.6 1-3 1.7V8.6H10.2c0 .7 0 10.4 0 10.4h2.6v-5.8c0-.3 0-.6.1-.9.3-.6.8-1.3 1.8-1.3 1.3 0 1.9 1 1.9 2.4V19h2.7Z"
      />
    </svg>
  );
}

const BACKGROUND: Record<PlatformId, string> = {
  facebook: '#1877F2',
  instagram: 'linear-gradient(135deg,#FEDA75 0%,#FA7E1E 25%,#D62976 50%,#962FBF 75%,#4F5BD5 100%)',
  youtube: '#FF0000',
  tiktok: '#000000',
  x: '#000000',
  linkedin: '#0A66C2',
};

const GLYPH: Record<PlatformId, () => ReactElement> = {
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
  youtube: YouTubeGlyph,
  tiktok: TikTokGlyph,
  x: XGlyph,
  linkedin: LinkedInGlyph,
};

export function PlatformIcon({ platform, className }: { platform: PlatformId; className?: string }) {
  const Glyph = GLYPH[platform];
  return (
    <span
      className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl', className)}
      style={{ background: BACKGROUND[platform] }}
      aria-hidden
    >
      <Glyph />
    </span>
  );
}
