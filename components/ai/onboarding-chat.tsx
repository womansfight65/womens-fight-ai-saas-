'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, Sparkles } from 'lucide-react';

import { AIMessageBubble, AssistantAvatar } from '@/components/ai/ai-message';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThinkingDots } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { detectLanguage, LANGUAGE_LABELS } from '@/lib/ai/language';
import type { AIMessage, SupportedLanguage } from '@/types';
import { completeOnboardingAction } from '@/app/onboarding/actions';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: SupportedLanguage | null;
}

const THINKING_LABELS = [
  'Understanding your business…',
  'Noting that down…',
  'Working out what to ask next…',
];

export function OnboardingChat({
  conversationId,
  initialMessages,
  initialReady,
  initialCompleteness,
}: {
  conversationId: string;
  initialMessages: AIMessage[];
  initialReady: boolean;
  initialCompleteness: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map((m) => ({
      id: m.id,
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      language: m.language,
    })),
  );
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(initialReady);
  const [completeness, setCompleteness] = useState(initialCompleteness);
  const [thinkingLabel, setThinkingLabel] = useState(THINKING_LABELS[0]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (!sending) return;
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % THINKING_LABELS.length;
      setThinkingLabel(THINKING_LABELS[index]);
    }, 2200);
    return () => clearInterval(timer);
  }, [sending]);

  const detected = draft.trim() ? detectLanguage(draft).language : null;

  async function send() {
    const message = draft.trim();
    if (!message || sending) return;

    const detection = detectLanguage(message);
    setMessages((current) => [
      ...current,
      { id: `local-${Date.now()}`, role: 'user', content: message, language: detection.language },
    ]);
    setDraft('');
    setSending(true);

    try {
      const response = await fetch('/api/ai/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.push(data.error ?? 'The assistant could not answer. Try again.', 'error');
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: data.reply.id,
          role: 'assistant',
          content: data.reply.content,
          language: data.reply.language,
        },
      ]);
      setReady(Boolean(data.ready));
      setCompleteness(Number(data.completeness ?? 0));
    } catch {
      toast.push('Network problem — your message was not sent.', 'error');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function finish() {
    startTransition(async () => {
      await completeOnboardingAction();
      router.push('/dashboard/planner?generate=1');
    });
  }

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[520px] flex-col overflow-hidden rounded-4xl border border-line bg-surface-soft shadow-soft">
      <div className="border-b border-line bg-white px-5 py-4 sm:px-6">
        <Progress value={completeness} label="Business Brain" />
      </div>

      <div ref={scrollRef} className="wf-scroll flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.map((message) => (
          <AIMessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            language={message.language}
          />
        ))}

        {sending ? (
          <div className="flex gap-3">
            <AssistantAvatar className="mt-1 h-8 w-8" />
            <div className="rounded-3xl rounded-bl-lg border border-line bg-white px-4 py-3 shadow-soft">
              <ThinkingDots label={thinkingLabel} />
            </div>
          </div>
        ) : null}

        {ready ? (
          <div className="rounded-3xl border border-brand-purple/25 bg-white p-5 shadow-soft">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-brand-purple" aria-hidden />
              Your Business Brain is ready.
            </p>
            <p className="mt-1.5 text-sm text-ink-muted">
              You can keep chatting to add more, or build your first month now.
            </p>
            <Button className="mt-4" onClick={finish} loading={pending}>
              Create my 30-day plan
            </Button>
          </div>
        ) : null}
      </div>

      <div className="border-t border-line bg-white p-4 sm:p-5">
        <div className="flex items-end gap-3 rounded-3xl border border-line-strong bg-white p-2 pl-4 transition-colors focus-within:border-brand-purple/50 focus-within:ring-2 focus-within:ring-brand-purple/20">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder="Bangla, Banglish or English — whatever is easiest…"
            aria-label="Message the assistant"
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <Button
            size="sm"
            onClick={() => void send()}
            loading={sending}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="h-10 w-10 !px-0"
          >
            {sending ? null : <ArrowUp className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 flex items-center justify-between px-1 text-2xs text-ink-faint">
          <span>Enter to send · Shift + Enter for a new line</span>
          {detected ? <span>Detected: {LANGUAGE_LABELS[detected]}</span> : null}
        </p>
      </div>
    </div>
  );
}
