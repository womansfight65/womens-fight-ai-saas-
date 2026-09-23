import { FEATURES } from '@/lib/config/marketing';
import { SectionHeading } from './section-heading';

export function FeaturesGrid() {
  return (
    <section id="features" className="wf-section border-t border-line bg-surface-soft">
      <div className="container">
        <SectionHeading
          eyebrow="Features"
          title="Everything a one-person marketing team needs"
          description="Built around a single idea: the AI does the work, and you stay the one who decides."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group flex flex-col rounded-3xl border border-line bg-white p-6 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-brand-purple/25 hover:shadow-lift"
            >
              <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-brand-purple">
                {feature.tag}
              </span>
              <h3 className="mt-3 text-base font-semibold leading-snug text-ink">{feature.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
