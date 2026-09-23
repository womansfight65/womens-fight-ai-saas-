import { PLATFORM_LIST } from '@/lib/config/platforms';
import { Badge } from '@/components/ui/badge';
import { SectionHeading } from './section-heading';

export function PlatformsSection() {
  return (
    <section className="wf-section border-t border-line bg-surface-soft">
      <div className="container">
        <SectionHeading
          eyebrow="Platforms"
          title="Six networks, six different ways of writing"
          description="The same idea, rewritten for where it lands. Publishing integrations arrive platform by platform — each one is marked honestly until its API is connected."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_LIST.map((platform) => (
            <div
              key={platform.id}
              className="flex flex-col rounded-3xl border border-line bg-white p-6 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: platform.accent }}
                    aria-hidden
                  >
                    {platform.name.slice(0, 1)}
                  </span>
                  <h3 className="text-base font-semibold text-ink">{platform.name}</h3>
                </div>
                <Badge tone={platform.integrationReady ? 'success' : 'neutral'}>
                  {platform.integrationReady ? 'Connected' : 'Coming soon'}
                </Badge>
              </div>
              <p className="mt-3.5 text-sm leading-relaxed text-ink-muted">{platform.style}</p>
              <p className="mt-4 text-xs text-ink-faint">
                Caption limit {platform.captionLimit.toLocaleString()} · {platform.hashtagSweetSpot[0]}–
                {platform.hashtagSweetSpot[1]} hashtags
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
