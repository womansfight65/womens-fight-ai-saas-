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
    q: 'Do I have to write in English?',
    a: 'No. Write in Bangla, in Banglish (Bengali typed with English letters), in English, or all three in one message. The assistant detects it and answers in the same style. You never pick a language from a menu.',
  },
  {
    q: 'Will it post to my social accounts automatically?',
    a: 'Only after you approve a post, and only once you have connected that platform. Publishing integrations are a future phase, and until a platform is genuinely connected the app says "coming soon" rather than pretending.',
  },
  {
    q: 'Can I edit what the AI writes?',
    a: 'Every field: topic, hook, caption, CTA, hashtags, date and time. You can also regenerate a single post without touching the rest of the plan. Editing approved content sends it back for review so you re-approve what you changed.',
  },
  {
    q: 'Does it just repeat the same sales post 30 times?',
    a: 'No. The strategy deliberately mixes awareness, education, engagement, trust, storytelling, community and conversion, and caps direct sales posts at roughly one in four.',
  },
  {
    q: 'What happens if I close my browser?',
    a: 'Nothing. Scheduled posts live in the database and are picked up by a server-side worker, so your laptop does not need to be on.',
  },
  {
    q: 'Do you generate images and videos?',
    a: 'The architecture is in place and every post already carries an image concept and a video concept. Generation itself switches on when an image or video provider is configured — until then the app shows it as a future feature rather than a broken button.',
  },
  {
    q: 'Is my business data private?',
    a: 'Your Business Brain and content belong to your workspace and are isolated with Postgres row level security, so the database itself refuses cross-workspace reads. API keys stay server-side.',
  },
  {
    q: 'How does pricing work?',
    a: 'A free tier covers one workspace and one plan a month. Pro and Business raise the limits. Payment processing is not connected in this build, and the app says so instead of showing a checkout that cannot complete.',
  },
] as const;
