'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { ContentCard } from '@/components/content/content-card';
import { ContentEditor } from '@/components/content/content-editor';
import { Tabs, type TabItem } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/states';
import { Select } from '@/components/ui/input';
import { PLATFORM_LIST } from '@/lib/config/platforms';
import type { ContentItem, ContentStatus, PlatformId } from '@/types';

type StatusFilter = ContentStatus | 'all';

const TABS: TabItem<StatusFilter>[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'generated', label: 'Generated' },
  { id: 'approved', label: 'Approved' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' },
];

export function ContentBrowser({
  items,
  showFilters = true,
  emptyTitle = 'Nothing here yet.',
  emptyDescription,
  emptyAction,
}: {
  items: ContentItem[];
  showFilters?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [platform, setPlatform] = useState<PlatformId | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContentItem | null>(null);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: items.length };
    for (const item of items) base[item.status] = (base[item.status] ?? 0) + 1;
    return base;
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (platform !== 'all' && item.platform !== platform) return false;
      if (!term) return true;
      return `${item.topic} ${item.hook} ${item.caption} ${item.hashtags.join(' ')}`
        .toLowerCase()
        .includes(term);
    });
  }, [items, status, platform, search]);

  const tabs = TABS.map((tab) => ({ ...tab, count: counts[tab.id] ?? 0 }));

  return (
    <div className="space-y-5">
      {showFilters ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs items={tabs} value={status} onChange={setStatus} className="lg:max-w-[560px]" />

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search content…"
                aria-label="Search content"
                className="h-11 w-full rounded-2xl border border-line-strong bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-brand-purple/60 focus:ring-2 focus:ring-brand-purple/20 sm:w-56"
              />
            </div>

            <Select
              aria-label="Filter by platform"
              value={platform}
              onChange={(event) => setPlatform(event.target.value as PlatformId | 'all')}
              wrapperClassName="sm:w-44"
              className="!py-2.5"
            >
              <option value="all">All platforms</option>
              {PLATFORM_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? emptyTitle : 'Nothing matches those filters.'}
          description={items.length === 0 ? emptyDescription : 'Try a different status, platform or search term.'}
          action={items.length === 0 ? emptyAction : null}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} onOpen={setSelected} />
          ))}
        </div>
      )}

      <ContentEditor
        item={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}
