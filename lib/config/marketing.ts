export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tell it about your business — once',
    body: 'A short chat, in Bangla, Banglish or English. No forms, no dropdowns. The assistant asks what it actually needs and nothing more.',
  },
  {
    step: '02',
    title: 'It builds your Business Brain',
    body: 'What you sell, who buys it, what they worry about, how your brand sounds. Stored once, used by every generation after that.',
  },
  {
    step: '03',
    title: 'You get a 30-day plan',
    body: 'Thirty days of topics, hooks, captions, CTAs, hashtags and image ideas — planned as a strategy, not thirty random posts.',
  },
  {
    step: '04',
    title: 'You review, edit and approve',
    body: 'Change anything. Regenerate what you do not like. Nothing moves forward until you approve it.',
  },
  {
    step: '05',
    title: 'Approved content gets scheduled',
    body: 'Your calendar fills up. Scheduling runs on the server, so closing the browser changes nothing.',
  },
] as const;

export const AI_WORKFLOW = [
  { label: 'Business understanding', detail: 'A conversation, not a questionnaire.' },
  { label: 'Business Brain', detail: 'Persistent memory of your business.' },
  { label: 'Content strategy', detail: 'Objectives balanced across the month.' },
  { label: '30-day plan', detail: 'Every day gets a purpose.' },
  { label: 'Content generation', detail: 'Hook, caption, CTA, hashtags.' },
  { label: 'Platform adaptation', detail: 'Rewritten per network, never copy-pasted.' },
  { label: 'Your approval', detail: 'The step that never gets skipped.' },
  { label: 'Scheduling', detail: 'Queued server-side with retries.' },
  { label: 'Analytics', detail: 'Real numbers only, once connected.' },
] as const;

export const FEATURES = [
  {
    title: 'Talks the way you talk',
    body: 'Bangla, Banglish and English — understood and answered in the same style, switching mid-sentence if you do.',
    tag: 'Language',
  },
  {
    title: 'A brain, not a prompt box',
    body: 'Your business is stored once. You never re-explain what you sell or who you sell it to.',
    tag: 'Business Brain',
  },
  {
    title: 'A month of strategy',
    body: 'Awareness, education, trust, stories, community — and offers placed where they have been earned.',
    tag: 'Planning',
  },
  {
    title: 'Written per platform',
    body: 'A LinkedIn post is not an Instagram caption with fewer hashtags. Each one is rewritten for where it lands.',
    tag: 'Adaptation',
  },
  {
    title: 'Approval comes first',
    body: 'AI drafts, you decide. Nothing is scheduled or published without you saying yes.',
    tag: 'Control',
  },
  {
    title: 'Calendar and library',
    body: 'See the whole month, move a post to another day, find anything you have ever written.',
    tag: 'Organisation',
  },
  {
    title: 'Server-side scheduling',
    body: 'The queue lives in the database with retries and error states, not in an open browser tab.',
    tag: 'Reliability',
  },
  {
    title: 'Built to grow',
    body: 'Workspaces, brands and teams are in the data model from day one, so an agency fits without a rebuild.',
    tag: 'Scale',
  },
] as const;

export const FAQS = [
  {
    q: 'ইংরেজিতেই লিখতে হবে?',
    a: 'না। বাংলা, বাংলিশ (ইংরেজি হরফে বাংলা), ইংরেজি — অথবা এক মেসেজেই তিনটা মিলিয়ে লিখুন। AI নিজে বুঝে নেয় এবং একই ধরনে উত্তর দেয়। ভাষা বেছে নেওয়ার কোনো মেনু নেই।',
  },
  {
    q: 'এটা কি নিজে থেকেই সোশ্যাল মিডিয়ায় পোস্ট করে দেবে?',
    a: 'শুধু তখনই, যখন আপনি একটা পোস্ট অনুমোদন করবেন আর সেই প্ল্যাটফর্ম কানেক্ট করা থাকবে। Publishing ইন্টিগ্রেশন এখনো ধাপে ধাপে যোগ হচ্ছে — যে প্ল্যাটফর্ম সত্যিই কানেক্ট নেই, সেখানে অ্যাপ সরাসরি "শীঘ্রই আসছে" দেখায়, ভান করে না।',
  },
  {
    q: 'AI যা লিখে দেয়, তা কি এডিট করা যায়?',
    a: 'হ্যাঁ, প্রতিটা অংশ — টপিক, হুক, ক্যাপশন, CTA, হ্যাশট্যাগ, তারিখ ও সময়। পুরো প্ল্যান না ছুঁয়ে শুধু একটা পোস্টও আবার জেনারেট করতে পারেন। অনুমোদিত কনটেন্ট এডিট করলে সেটা আবার রিভিউতে ফিরে যায়, যাতে বদলানো অংশটাও আপনি আবার অনুমোদন করেন।',
  },
  {
    q: 'একই সেলস পোস্ট কি ৩০ বার রিপিট হয়?',
    a: 'না। স্ট্র্যাটেজিতে ইচ্ছাকৃতভাবে awareness, education, engagement, trust, storytelling, community আর conversion মেশানো থাকে — সরাসরি সেলস পোস্ট থাকে মোটামুটি চারটার একটাতে।',
  },
  {
    q: 'ব্রাউজার বন্ধ করে দিলে কী হবে?',
    a: 'কিছুই না। Scheduled পোস্ট ডাটাবেজে থাকে এবং সার্ভার-সাইড ওয়ার্কার সেগুলো নিয়ে কাজ করে — আপনার ল্যাপটপ চালু রাখার দরকার নেই।',
  },
  {
    q: 'ছবি বা ভিডিও কি তৈরি করে দেয়?',
    a: 'পুরো সিস্টেম এর জন্য তৈরি — প্রতিটা পোস্টের সাথেই একটা image concept আর video concept থাকে। যখন কোনো image/video provider কানেক্ট হবে, তখনই সেটা চালু হয়ে যাবে — এর আগে অ্যাপ সেটাকে "আসছে" হিসেবেই দেখায়, ভাঙা বাটন হিসেবে না।',
  },
  {
    q: 'আমার ব্যবসার তথ্য কি নিরাপদ?',
    a: 'আপনার Business Brain ও কনটেন্ট শুধু আপনার workspace-এর — Postgres row level security দিয়ে আলাদা করা, তাই ডাটাবেজ নিজেই অন্য workspace-এর রিড আটকে দেয়। API key সবসময় সার্ভার-সাইডে থাকে।',
  },
  {
    q: 'দাম কীভাবে কাজ করে?',
    a: 'Free প্ল্যানে একটা workspace ও মাসে একটা প্ল্যান পাবেন। Pro আর Business-এ লিমিট বাড়ে। এই বিল্ডে পেমেন্ট এখনো কানেক্ট করা নেই — অ্যাপ সেটা স্পষ্ট করেই বলে, অসম্পূর্ণ checkout দেখায় না।',
  },
] as const;
