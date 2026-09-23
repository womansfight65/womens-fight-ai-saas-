'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  CheckCircle2,
  CalendarClock,
  RefreshCw,
  Save,
  Trash2,
  Undo2,
  Wand2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';
import { CONTENT_TYPE_LABELS, OBJECTIVE_LABELS, PLATFORMS, PLATFORM_LIST } from '@/lib/config/platforms';
import type { ContentItem, ContentObjective, ContentType, PlatformId } from '@/types';
import {
  approveContentAction,
  deleteContentAction,
  regenerateContentAction,
  scheduleContentAction,
  unapproveContentAction,
  updateContentAction,
} from '@/app/dashboard/actions';

export function ContentEditor({
  item,
  open,
  onClose,
  onChanged,
}: {
  item: ContentItem | null;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ContentItem | null>(item);
  const [instruction, setInstruction] = useState('');

  useEffect(() => {
    setDraft(item);
    setInstruction('');
  }, [item]);

  if (!draft) return null;

  const isBangla = draft.language === 'bn';
  const platform = PLATFORMS[draft.platform];
  const captionLength = draft.caption.length;
  const overLimit = captionLength > platform.captionLimit;

  function set<K extends keyof ContentItem>(key: K, value: ContentItem[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      toast.push(result.message ?? (result.ok ? 'Done.' : 'That did not work.'), result.ok ? 'success' : 'error');
      if (result.ok) onChanged?.();
    });
  }

  const save = () =>
    run(async () =>
      updateContentAction(draft.id, {
        topic: draft.topic,
        hook: draft.hook,
        caption: draft.caption,
        cta: draft.cta,
        hashtags: draft.hashtags,
        scheduled_date: draft.scheduled_date,
        scheduled_time: draft.scheduled_time,
        platform: draft.platform,
        content_type: draft.content_type,
        objective: draft.objective,
        image_concept: draft.image_concept,
        video_concept: draft.video_concept,
      }),
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={draft.day_number ? `Day ${draft.day_number} · ${draft.topic}` : draft.topic}
      description={`${platform.name} · ${CONTENT_TYPE_LABELS[draft.content_type]}`}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() =>
              run(async () => {
                const result = await deleteContentAction(draft.id);
                if (result.ok) onClose();
                return result;
              })
            }
            className="mr-auto text-state-danger hover:bg-state-danger/5"
          >
            Delete
          </Button>

          <Button variant="outline" size="sm" icon={<Save className="h-4 w-4" />} onClick={save} loading={pending}>
            Save
          </Button>

          {draft.status === 'approved' || draft.status === 'scheduled' ? (
            <Button
              variant="outline"
              size="sm"
              icon={<Undo2 className="h-4 w-4" />}
              onClick={() => run(() => unapproveContentAction(draft.id))}
            >
              Unapprove
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => run(() => approveContentAction(draft.id))}
            >
              Approve
            </Button>
          )}

          <Button
            size="sm"
            icon={<CalendarClock className="h-4 w-4" />}
            onClick={() =>
              run(() => scheduleContentAction(draft.id, draft.scheduled_date, draft.scheduled_time))
            }
          >
            Schedule
          </Button>
        </>
      }
    >
      <div className="grid gap-7 lg:grid-cols-[1fr_340px]">
        {/* Editable fields */}
        <div className="space-y-5">
          <Input label="Topic" value={draft.topic} onChange={(e) => set('topic', e.target.value)} />

          <Textarea
            label="Hook"
            value={draft.hook}
            onChange={(e) => set('hook', e.target.value)}
            className={cn('min-h-[72px]', isBangla && 'font-bangla')}
            lang={isBangla ? 'bn' : undefined}
          />

          <Textarea
            label="Caption"
            value={draft.caption}
            onChange={(e) => set('caption', e.target.value)}
            className={cn('min-h-[200px]', isBangla && 'font-bangla')}
            lang={isBangla ? 'bn' : undefined}
            hint={`${captionLength} / ${platform.captionLimit} characters for ${platform.name}`}
            error={overLimit ? `${captionLength - platform.captionLimit} characters over the ${platform.name} limit.` : undefined}
          />

          <Input label="Call to action" value={draft.cta} onChange={(e) => set('cta', e.target.value)} />

          <Input
            label="Hashtags"
            value={draft.hashtags.join(' ')}
            onChange={(e) => set('hashtags', e.target.value.split(/\s+/).filter(Boolean))}
            hint={`${platform.name} does best with ${platform.hashtagSweetSpot[0]}–${platform.hashtagSweetSpot[1]}.`}
          />

          <div className="rounded-2xl border border-line bg-surface-soft p-4">
            <p className="text-sm font-medium text-ink">Regenerate</p>
            <p className="mt-1 text-xs text-ink-muted">
              Optional: say what to change. Leave it blank for a fresh take.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Make it shorter and warmer…"
                className="flex-1 rounded-2xl border border-line-strong bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-purple/60 focus:ring-2 focus:ring-brand-purple/20"
              />
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="h-4 w-4" />}
                loading={pending}
                onClick={() => run(() => regenerateContentAction(draft.id, instruction || undefined))}
              >
                Regenerate
              </Button>
            </div>
          </div>
        </div>

        {/* Meta + preview */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-surface-soft p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-faint">Status</span>
              <StatusBadge status={draft.status} />
            </div>
          </div>

          <Select
            label="Platform"
            value={draft.platform}
            onChange={(e) => set('platform', e.target.value as PlatformId)}
          >
            {PLATFORM_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <Select
            label="Content type"
            value={draft.content_type}
            onChange={(e) => set('content_type', e.target.value as ContentType)}
          >
            {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <Select
            label="Objective"
            value={draft.objective}
            onChange={(e) => set('objective', e.target.value as ContentObjective)}
          >
            {Object.entries(OBJECTIVE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={draft.scheduled_date}
              onChange={(e) => set('scheduled_date', e.target.value)}
            />
            <Input
              label="Time"
              type="time"
              value={draft.scheduled_time}
              onChange={(e) => set('scheduled_time', e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
              <Wand2 className="h-3.5 w-3.5" aria-hidden />
              Media concepts
            </p>
            <p className="mt-2.5 text-sm text-ink-soft">{draft.image_concept ?? 'No image concept.'}</p>
            {draft.video_concept ? (
              <p className="mt-2 text-sm text-ink-soft">{draft.video_concept}</p>
            ) : null}
            <p className="mt-3 text-2xs text-ink-faint">
              Image and video generation switch on when a provider is configured.
            </p>
          </div>

          <ContentPreview item={draft} />
        </div>
      </div>
    </Modal>
  );
}

function ContentPreview({ item }: { item: ContentItem }) {
  const platform = PLATFORMS[item.platform];
  const isBangla = item.language === 'bn';
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-2xs font-bold text-white"
          style={{ backgroundColor: platform.accent }}
          aria-hidden
        >
          {platform.name.slice(0, 1)}
        </span>
        <span className="text-xs font-medium text-ink-soft">Preview · {platform.name}</span>
      </div>
      <div className="p-4">
        <p
          lang={isBangla ? 'bn' : undefined}
          className={cn('whitespace-pre-wrap text-sm leading-relaxed text-ink', isBangla && 'font-bangla')}
        >
          {item.hook}
          {'\n\n'}
          {item.caption}
          {'\n\n'}
          {item.cta}
        </p>
        {item.hashtags.length ? (
          <p className="mt-3 text-sm text-brand-purple">{item.hashtags.join(' ')}</p>
        ) : null}
      </div>
    </div>
  );
}
