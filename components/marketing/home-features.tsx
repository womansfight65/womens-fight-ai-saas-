import { SectionHeading } from './section-heading';

const FEATURES = [
  {
    tag: 'ভাষা',
    title: 'আপনি যেভাবে বলেন, সেভাবেই বোঝে',
    body: 'বাংলা, বাংলিশ ও ইংরেজি — এক বাক্যের মাঝে ভাষা বদলালেও বুঝে সেভাবেই উত্তর দেয়।',
  },
  {
    tag: 'Business Brain',
    title: 'প্রতিবার নতুন করে বলতে হয় না',
    body: 'আপনার ব্যবসা একবার সেভ হয়ে যায় — কী বিক্রি করেন, কাকে বিক্রি করেন, বারবার লিখতে হয় না।',
  },
  {
    tag: 'পরিকল্পনা',
    title: 'পুরো মাসের একটা স্ট্র্যাটেজি',
    body: 'Awareness, education, trust, storytelling — অফার আসে তখনই, যখন সেটার জায়গা তৈরি হয়েছে।',
  },
  {
    tag: 'প্ল্যাটফর্ম',
    title: 'প্রতিটা প্ল্যাটফর্মের জন্য আলাদা লেখা',
    body: 'Instagram-এর ক্যাপশন কেটে LinkedIn-এ বসানো নয় — প্রতিটা জায়গার জন্য আলাদাভাবে লেখা হয়।',
  },
  {
    tag: 'নিয়ন্ত্রণ',
    title: 'অনুমোদনই সবার আগে',
    body: 'AI খসড়া তৈরি করে, সিদ্ধান্ত আপনার। আপনার অনুমতি ছাড়া কিছু schedule বা publish হয় না।',
  },
  {
    tag: 'সংগঠন',
    title: 'ক্যালেন্ডার আর লাইব্রেরি',
    body: 'পুরো মাস এক নজরে দেখুন, যেকোনো পোস্ট অন্য দিনে সরান, আগে লেখা যেকোনো কনটেন্ট খুঁজে বের করুন।',
  },
] as const;

export function HomeFeatures() {
  return (
    <section id="features" className="wf-section border-t border-line" lang="bn">
      <div className="container">
        <SectionHeading
          eyebrow="ফিচার"
          title="একজনের মার্কেটিং টিমের জন্য যা যা দরকার"
          description="একটাই ধারণা নিয়ে বানানো — কাজটা করবে AI, সিদ্ধান্তটা থাকবে আপনার হাতে।"
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
