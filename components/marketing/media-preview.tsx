import { Image as ImageIcon, Clapperboard } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { SectionHeading } from './section-heading';

const IMAGE_STAGES = ['Content', 'Image prompt', 'Provider', 'Preview', 'Regenerate', 'Approve'];
const VIDEO_STAGES = ['Script', 'Scene plan', 'Visuals', 'Voice', 'Music', 'Render', 'Approve'];

export function MediaPreview() {
  return (
    <section className="wf-section">
      <div className="container">
        <SectionHeading
          eyebrow="Image & video automation"
          title="The pipeline is built. The providers plug in."
          description="Every post already carries an image concept and a video concept. Generation switches on the moment a provider is configured — and until then the app says so instead of showing a button that does nothing."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {[
            { icon: ImageIcon, title: 'AI image generation', stages: IMAGE_STAGES, formats: ['Instagram post', 'Story', 'Carousel', 'Product creative', 'Quote graphic'] },
            { icon: Clapperboard, title: 'AI video generation', stages: VIDEO_STAGES, formats: ['Reel', 'Short', 'Product demo'] },
          ].map((block) => (
            <div key={block.title} className="wf-card p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient-soft text-brand-purple">
                    <block.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-base font-semibold text-ink">{block.title}</h3>
                </div>
                <Badge tone="warning">Provider not connected</Badge>
              </div>

              <ol className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
                {block.stages.map((stage, index) => (
                  <li key={stage} className="flex items-center gap-2">
                    <span className="rounded-full border border-line bg-surface-soft px-3 py-1.5 text-xs font-medium text-ink-soft">
                      {stage}
                    </span>
                    {index < block.stages.length - 1 ? (
                      <span className="text-ink-faint" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                {block.formats.map((format) => (
                  <span key={format} className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
                    {format}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
