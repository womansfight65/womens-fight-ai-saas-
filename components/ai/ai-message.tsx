import { cn } from '@/lib/utils/cn';
import { LANGUAGE_LABELS } from '@/lib/ai/language';
import type { SupportedLanguage } from '@/types';

export function AIMessageBubble({
  role,
  content,
  language,
}: {
  role: 'user' | 'assistant';
  content: string;
  language?: SupportedLanguage | null;
}) {
  const isUser = role === 'user';
  const isBangla = language === 'bn';

  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser ? (
        <span
          className="mt-1 h-8 w-8 shrink-0 rounded-full bg-brand-gradient"
          aria-hidden
        />
      ) : null}

      <div className={cn('max-w-[min(560px,82%)]', isUser && 'flex flex-col items-end')}>
        <div
          lang={isBangla ? 'bn' : undefined}
          className={cn(
            'whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-br-lg bg-ink text-white'
              : 'rounded-bl-lg border border-line bg-white text-ink shadow-soft',
            isBangla && 'font-bangla',
          )}
        >
          {content}
        </div>
        {language && !isUser ? (
          <span className="mt-1.5 block text-2xs text-ink-faint">{LANGUAGE_LABELS[language]}</span>
        ) : null}
      </div>
    </div>
  );
}
