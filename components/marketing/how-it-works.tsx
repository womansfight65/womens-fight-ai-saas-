import { HOW_IT_WORKS } from '@/lib/config/marketing';
import { SectionHeading } from './section-heading';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="wf-section border-t border-line bg-surface-soft">
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="Five steps, and only one of them is yours"
          description="The work that used to take a weekend now takes one conversation and a review pass."
        />

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((item, index) => (
            <li
              key={item.step}
              className="group relative flex flex-col rounded-3xl border border-line bg-white p-6 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="font-display text-sm font-bold tracking-widest text-brand-purple">
                {item.step}
              </span>
              <h3 className="mt-4 text-base font-semibold leading-snug text-ink">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
