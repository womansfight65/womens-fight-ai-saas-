import { SectionHeading } from './section-heading';

const STEPS = [
  {
    step: '০১',
    title: 'একবার ব্যবসার কথা বলুন',
    body: 'বাংলা, বাংলিশ বা ইংরেজি — যেভাবে সহজ, সেভাবেই। কোনো ফর্ম নেই, শুধু একটা ছোট চ্যাট।',
  },
  {
    step: '০২',
    title: 'AI আপনার Business Brain তৈরি করে',
    body: 'আপনি কী বিক্রি করেন, কারা কেনেন, ব্র্যান্ডের সুর কেমন — একবার সেভ হয়, প্রতিটি কনটেন্টে কাজে লাগে।',
  },
  {
    step: '০৩',
    title: '৩০ দিনের প্ল্যান পাবেন',
    body: 'পুরো মাসের টপিক, ক্যাপশন, CTA, হ্যাশট্যাগ — এলোমেলো পোস্ট নয়, একটা গোছানো স্ট্র্যাটেজি হিসেবে।',
  },
  {
    step: '০৪',
    title: 'রিভিউ করুন, অনুমোদন দিন',
    body: 'যা খুশি বদলান, আবার জেনারেট করুন। আপনার অনুমোদন ছাড়া কিছুই পরের ধাপে যায় না।',
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section id="how-it-works" className="wf-section border-t border-line bg-surface-soft" lang="bn">
      <div className="container">
        <SectionHeading
          eyebrow="যেভাবে কাজ করে"
          title="৪টা ধাপ, আর একটা মাত্র কাজ আপনার"
          description="যে কাজে আগে পুরো একটা উইকেন্ড লাগত, এখন লাগে একটা চ্যাট আর একটা রিভিউ।"
        />

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <li
              key={item.step}
              className="group relative flex flex-col rounded-3xl border border-line bg-white p-6 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="font-display text-sm font-bold tracking-widest text-brand-purple">{item.step}</span>
              <h3 className="mt-4 text-base font-semibold leading-snug text-ink">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
