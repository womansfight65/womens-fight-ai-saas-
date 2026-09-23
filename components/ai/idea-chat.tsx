'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { ArrowUp, Check, X } from 'lucide-react';

import { AIMessageBubble, AssistantAvatar } from '@/components/ai/ai-message';
import { approveContentAction, deleteContentAction } from '@/app/dashboard/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThinkingDots } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { detectLanguage, LANGUAGE_LABELS } from '@/lib/ai/language';
import { CONTENT_TYPE_LABELS, OBJECTIVE_LABELS, PLATFORMS } from '@/lib/config/platforms';
import { truncate } from '@/lib/utils/text';
import { cn } from '@/lib/utils/cn';
import type { AIMessage, ContentItem, SupportedLanguage } from '@/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: SupportedLanguage | null;
}

type ReviewState = 'pending' | 'working' | 'approved' | 'cancelled';

interface Batch {
  id: string;
  items: Array<ContentItem & { reviewState: ReviewState }>;
}

const THINKING_LABELS = ['Reading your idea…', 'Thinking about it…', 'Noting that down…'];

export function IdeaChat({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: AIMessage[];
}) {
  const toast = useToast();

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
  const [thinkingLabel, setThinkingLabel] = useState(THINKING_LABELS[0]);
  /* Every batch created this session stays on screen — approving or cancelling
   * one never touches the others, and a new batch never replaces an old one. */
  const [batches, setBatches] = useState<Batch[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, batches]);

  useEffect(() => {
    if (!sending) return;
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % THINKING_LABELS.length;
      setThinkingLabel(THINKING_LABELS[index]);
    }, 1800);
    return () => clearInterval(timer);
  }, [sending]);

  const detected = draft.trim() ? detectLanguage(draft).language : null;

  function setItemState(batchId: string, itemId: string, reviewState: ReviewState) {
    setBatches((current) =>
      current.map((batch) =>
        batch.id !== batchId
          ? batch
          : { ...batch, items: batch.items.map((item) => (item.id === itemId ? { ...item, reviewState } : item)) },
      ),
    );
  }

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
      const response = await fetch('/api/ai/ideas', {
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

      if (data.mode === 'generate' && data.generated) {
        const items = (data.generated.items as ContentItem[]).map((item) => ({
          ...item,
          reviewState: 'pending' as ReviewState,
        }));
        setBatches((current) => [...current, { id: `batch-${Date.now()}`, items }]);
        toast.push(`${data.generated.count} posts created.`, 'success');
      }
    } catch {
      toast.push('Network problem — your message was not sent.', 'error');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <div className="flex h-[calc(100vh-170px)] min-h-[560px] flex-col overflow-hidden rounded-4xl border border-line bg-surface-soft shadow-soft">
      <div className="border-b border-line bg-white px-5 py-3.5 sm:px-6">
        <p className="text-sm text-ink-muted">
          Share ideas freely — nothing gets created until you say so.
        </p>
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

        {batches.map((batch) => (
          <PostBatch
            key={batch.id}
            batch={batch}
            onApprove={(itemId) => setItemState(batch.id, itemId, 'approved')}
            onCancel={(itemId) => setItemState(batch.id, itemId, 'cancelled')}
            onStart={(itemId) => setItemState(batch.id, itemId, 'working')}
          />
        ))}
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
            placeholder="Share an idea, or say “create 7 days, 5 posts a day”…"
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

function PostBatch({
  batch,
  onApprove,
  onCancel,
  onStart,
}: {
  batch: Batch;
  onApprove: (itemId: string) => void;
  onCancel: (itemId: string) => void;
  onStart: (itemId: string) => void;
}) {
  const pending = batch.items.filter((i) => i.reviewState === 'pending' || i.reviewState === 'working').length;

  return (
    <div className="rounded-3xl border border-brand-purple/25 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{batch.items.length} posts created</p>
        {pending > 0 ? (
          <Badge tone="brand">{pending} to review</Badge>
        ) : (
          <Badge tone="success">All reviewed</Badge>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        Approve the ones you like, cancel the rest — nothing publishes on its own.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {batch.items.map((item) => (
          <PostReviewCard
            key={item.id}
            item={item}
            onApprove={() => onApprove(item.id)}
            onCancel={() => onCancel(item.id)}
            onStart={() => onStart(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PostReviewCard({
  item,
  onApprove,
  onCancel,
  onStart,
}: {
  item: ContentItem & { reviewState: ReviewState };
  onApprove: () => void;
  onCancel: () => void;
  onStart: () => void;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const platform = PLATFORMS[item.platform];
  const decided = item.reviewState === 'approved' || item.reviewState === 'cancelled';

  function approve() {
    onStart();
    startTransition(async () => {
      const result = await approveContentAction(item.id);
      if (result.ok) {
        onApprove();
      } else {
        toast.push(result.message ?? 'Could not approve.', 'error');
      }
    });
  }

  function cancel() {
    onStart();
    startTransition(async () => {
      const result = await deleteContentAction(item.id);
      if (result.ok) {
        onCancel();
      } else {
        toast.push(result.message ?? 'Could not cancel.', 'error');
      }
    });
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border p-4 transition-opacity',
        item.reviewState === 'approved' && 'border-state-success/25 bg-state-success/5',
        item.reviewState === 'cancelled' && 'border-line bg-surface-soft opacity-60',
        item.reviewState === 'pending' || item.reviewState === 'working'
          ? 'border-line bg-white'
          : '',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-2xs font-bold text-white"
            style={{ backgroundColor: platform.accent }}
            aria-hidden
          >
            {platform.name.slice(0, 1)}
          </span>
          <span className="text-xs font-medium text-ink-muted">{platform.name}</span>
        </span>
        <Badge tone="neutral">{CONTENT_TYPE_LABELS[item.content_type]}</Badge>
      </div>

      <h4 className="mt-3 text-sm font-semibold leading-snug text-ink">{item.topic}</h4>
      <p
        lang={item.language === 'bn' ? 'bn' : undefined}
        className={cn('mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted', item.language === 'bn' && 'font-bangla')}
      >
        {truncate(item.hook || item.caption, 110)}
      </p>
      <p className="mt-2 text-2xs font-medium uppercase tracking-wider text-ink-faint">
        {OBJECTIVE_LABELS[item.objective]}
      </p>

      <div className="mt-3.5 border-t border-line pt-3.5">
        {item.reviewState === 'approved' ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-state-success">
            <Check className="h-4 w-4" aria-hidden /> Approved
          </p>
        ) : item.reviewState === 'cancelled' ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink-faint">
            <X className="h-4 w-4" aria-hidden /> Cancelled
          </p>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              icon={<Check className="h-3.5 w-3.5" />}
              onClick={approve}
              loading={pending && item.reviewState === 'working'}
              disabled={decided}
              className="flex-1"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<X className="h-3.5 w-3.5" />}
              onClick={cancel}
              loading={pending && item.reviewState === 'working'}
              disabled={decided}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
