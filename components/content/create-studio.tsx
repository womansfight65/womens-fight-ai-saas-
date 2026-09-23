'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, CheckCircle2, RefreshCw, Save, Sparkles, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { ThinkingDots } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';
import { detectLanguage, LANGUAGE_LABELS } from '@/lib/ai/language';
import { CONTENT_TYPE_LABELS, OBJECTIVE_LABELS, PLATFORMS } from '@/lib/config/platforms';
import type { GeneratedContent } from '@/lib/ai/schemas';
import type { SupportedLanguage } from '@/types';
import {
  approveContentAction,
  saveGeneratedContentAction,
  scheduleContentAction,
} from '@/app/dashboard/actions';

const EXAMPLES = [
  'amar jewellery business er jonno ekta Eid promotional post dao',
  'Write an educational carousel about choosing the right fabric for summer',
  'আগামী শুক্রবারের জন্য একটা engagement পোস্ট বানাও',
  'A LinkedIn post about why we started this business',
];

export function CreateStudio({ isMock }: { isMock: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [savedId, setSavedId] = useState<string | null>(null);

  const detected = request.trim() ? detectLanguage(request).language : null;

  async function generate(text = request) {
    const prompt = text.trim();
    if (!prompt || loading) return;
    setLoading(true);
    setSavedId(null);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.push(data.error ?? 'Generation failed.', 'error');
        return;
      }
      setResult(data.content as GeneratedContent);
      setLanguage(data.language as SupportedLanguage);
    } catch {
      toast.push('Network problem — nothing was generated.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof GeneratedContent>(key: K, value: GeneratedContent[K]) {
    setResult((current) => (current ? { ...current, [key]: value } : current));
  }

  async function ensureSaved(): Promise<string | null> {
    if (savedId) return savedId;
    if (!result) return null;
    const saved = await saveGeneratedContentAction(result, language);
    if (saved.ok && saved.id) {
      setSavedId(saved.id);
      return saved.id;
    }
    toast.push(saved.message ?? 'Could not save.', 'error');
    return null;
  }

  function handleSave() {
    startTransition(async () => {
      const id = await ensureSaved();
      if (id) toast.push('Saved to your library.', 'success');
    });
  }

  function handleApprove() {
    startTransition(async () => {
      const id = await ensureSaved();
      if (!id) return;
      const approved = await approveContentAction(id);
      toast.push(approved.message ?? 'Approved.', approved.ok ? 'success' : 'error');
    });
  }

  function handleSchedule() {
    startTransition(async () => {
      const id = await ensureSaved();
      if (!id) return;
      const approved = await approveContentAction(id);
      if (!approved.ok) {
        toast.push(approved.message ?? 'Could not approve.', 'error');
        return;
      }
      const scheduled = await scheduleContentAction(id);
      toast.push(scheduled.message ?? 'Scheduled.', scheduled.ok ? 'success' : 'error');
      if (scheduled.ok) router.push('/dashboard/calendar');
    });
  }

  const isBangla = language === 'bn';

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <label htmlFor="create-request" className="text-sm font-medium text-ink-soft">
            What do you want to post?
          </label>
          <div className="mt-2 flex flex-col gap-3 rounded-3xl border border-line-strong bg-white p-2 pl-4 transition-colors focus-within:border-brand-purple/50 focus-within:ring-2 focus-within:ring-brand-purple/20 sm:flex-row sm:items-end">
            <textarea
              id="create-request"
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  void generate();
                }
              }}
              rows={2}
              placeholder="Ask in Bangla, Banglish or English…"
              className="max-h-48 min-h-[56px] flex-1 resize-none bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <Button
              onClick={() => void generate()}
              loading={loading}
              disabled={!request.trim()}
              icon={loading ? undefined : <Sparkles className="h-4 w-4" />}
              className="shrink-0"
            >
              Generate
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setRequest(example);
                  void generate(example);
                }}
                className="rounded-full border border-line bg-surface-soft px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-brand-purple/30 hover:text-ink"
              >
                {example.length > 54 ? `${example.slice(0, 54)}…` : example}
              </button>
            ))}
          </div>

          <p className="mt-3 flex items-center justify-between text-2xs text-ink-faint">
            <span>⌘/Ctrl + Enter to generate</span>
            {detected ? <span>Detected: {LANGUAGE_LABELS[detected]}</span> : null}
          </p>
        </CardBody>
      </Card>

      {loading ? (
        <Card>
          <CardBody className="py-10 text-center">
            <ThinkingDots label="Writing your post…" />
          </CardBody>
        </Card>
      ) : null}

      {result && !loading ? (
        <Card>
          <CardHeader
            title="Your post"
            description={`${PLATFORMS[result.platform].name} · ${CONTENT_TYPE_LABELS[result.content_type]}`}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{OBJECTIVE_LABELS[result.objective]}</Badge>
                {isMock ? <Badge tone="warning">Development output</Badge> : null}
              </div>
            }
          />
          <CardBody className="space-y-5">
            {result.note ? (
              <p className="rounded-2xl bg-surface-soft px-4 py-3 text-sm text-ink-muted">{result.note}</p>
            ) : null}

            <Input label="Topic" value={result.topic} onChange={(e) => update('topic', e.target.value)} />
            <Textarea
              label="Hook"
              value={result.hook}
              onChange={(e) => update('hook', e.target.value)}
              className={cn('min-h-[72px]', isBangla && 'font-bangla')}
              lang={isBangla ? 'bn' : undefined}
            />
            <Textarea
              label="Caption"
              value={result.caption}
              onChange={(e) => update('caption', e.target.value)}
              className={cn('min-h-[180px]', isBangla && 'font-bangla')}
              lang={isBangla ? 'bn' : undefined}
              hint={`${result.caption.length} / ${PLATFORMS[result.platform].captionLimit} characters`}
            />
            <Input label="Call to action" value={result.cta} onChange={(e) => update('cta', e.target.value)} />
            <Input
              label="Hashtags"
              value={(result.hashtags ?? []).join(' ')}
              onChange={(e) => update('hashtags', e.target.value.split(/\s+/).filter(Boolean))}
            />

            <div className="rounded-2xl border border-line bg-surface-soft p-4">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
                <Wand2 className="h-3.5 w-3.5" aria-hidden />
                Media concepts
              </p>
              <p className="mt-2 text-sm text-ink-soft">{result.image_concept ?? 'No image concept.'}</p>
              {result.video_concept ? (
                <p className="mt-1.5 text-sm text-ink-soft">{result.video_concept}</p>
              ) : null}
            </div>
          </CardBody>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-line bg-surface-soft px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => void generate()}
              loading={loading}
            >
              Regenerate
            </Button>
            <Button variant="outline" size="sm" icon={<Save className="h-4 w-4" />} onClick={handleSave} loading={pending}>
              Save draft
            </Button>
            <Button variant="secondary" size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={handleApprove} loading={pending}>
              Approve
            </Button>
            <Button size="sm" icon={<CalendarClock className="h-4 w-4" />} onClick={handleSchedule} loading={pending}>
              Approve & schedule
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
