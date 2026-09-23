'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { FAQS } from '@/lib/config/marketing';

export function FaqAccordion({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = limit ? FAQS.slice(0, limit) : FAQS;

  return (
    <div className="mx-auto max-w-3xl divide-y divide-line overflow-hidden rounded-4xl border border-line bg-white shadow-soft">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : index)}
                aria-expanded={expanded}
                aria-controls={`faq-panel-${index}`}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-surface-soft"
              >
                <span className="text-sm font-semibold text-ink sm:text-base">{item.q}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300 ease-premium',
                    expanded && 'rotate-180 text-brand-purple',
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={`faq-panel-${index}`}
              hidden={!expanded}
              className="px-6 pb-6 text-sm leading-relaxed text-ink-muted"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
