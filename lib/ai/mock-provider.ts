import type { ContentObjective, ContentType, PlatformId, SupportedLanguage } from '@/types';
import { PLATFORMS } from '@/lib/config/platforms';
import type { AICompleteOptions, AIProvider, AIResult } from './provider';

/* ------------------------------------------------------------------ */
/* Copy banks                                                          */
/* ------------------------------------------------------------------ */

type Lang = SupportedLanguage;

const ONBOARDING_QUESTIONS: Record<Lang, string[]> = {
  en: [
    "Hi! I'm your AI content assistant. Tell me about your business — what do you sell or do?",
    'Got it. Who are your main customers?',
    'Thanks. What are your main products or services, and where are you based?',
    'Understood. What do you most want from social media over the next month — more reach, more messages, or more sales?',
    'Which platforms do you want to post on? Facebook, Instagram, TikTok, YouTube, X or LinkedIn?',
    'Last one: how should your brand sound — warm and friendly, expert and calm, or bold and playful?',
  ],
  bn: [
    'হ্যালো! আমি আপনার AI কনটেন্ট অ্যাসিস্ট্যান্ট। আপনার ব্যবসা নিয়ে বলুন — আপনি কী বিক্রি করেন বা কী করেন?',
    'বুঝলাম। আপনার main customer কারা?',
    'ধন্যবাদ। আপনার প্রধান product বা service কী কী, আর আপনি কোথা থেকে কাজ করেন?',
    'ঠিক আছে। আগামী এক মাসে সোশ্যাল মিডিয়া থেকে আপনি সবচেয়ে বেশি কী চান — বেশি মানুষের কাছে পৌঁছানো, বেশি মেসেজ, নাকি বেশি সেল?',
    'কোন কোন platform-এ পোস্ট করতে চান? Facebook, Instagram, TikTok, YouTube, X নাকি LinkedIn?',
    'শেষ প্রশ্ন: আপনার brand-এর কথা বলার ধরন কেমন হবে — আন্তরিক ও বন্ধুত্বপূর্ণ, নাকি বিশেষজ্ঞ ও শান্ত, নাকি সাহসী ও মজার?',
  ],
  banglish: [
    'Hi! Ami apnar AI content assistant. Apnar business ta niye bolun — ki sell koren ba ki kaj koren?',
    'Bujhlam. Apnar main customer ra kara?',
    'Dhonnobad. Apnar main product ba service gulo ki ki, ar apni kothay theke kaj koren?',
    'Thik ache. Agami ek mashe social media theke apni shobcheye beshi ki chan — beshi reach, beshi message, naki beshi sell?',
    'Kon kon platform e post korte chan? Facebook, Instagram, TikTok, YouTube, X naki LinkedIn?',
    'Shesh prosno: apnar brand er tone kemon hobe — warm ar friendly, expert ar calm, naki bold ar playful?',
  ],
};

const READY_MESSAGE: Record<Lang, string> = {
  en: "Perfect — I understand your business now. Your Business Brain is ready.",
  bn: 'দারুণ — আপনার ব্যবসাটা এখন আমি বুঝতে পেরেছি। আপনার Business Brain তৈরি।',
  banglish: 'Perfect — apnar business ta ekhon ami bujhte perechi. Apnar Business Brain ready.',
};

const DEV_NOTE: Record<Lang, string> = {
  en: '(Development mode: no Claude API key is configured, so this reply comes from the local placeholder assistant.)',
  bn: '(ডেভেলপমেন্ট মোড: Claude API key সেট করা নেই, তাই এই উত্তরটি লোকাল প্লেসহোল্ডার অ্যাসিস্ট্যান্ট থেকে এসেছে।)',
  banglish: '(Development mode: Claude API key set kora nei, tai ei reply ta local placeholder assistant theke esheche.)',
};

const TOPIC_TEMPLATES: Record<Lang, string[]> = {
  en: [
    'Introduce {business} and the people behind it',
    'The one mistake customers make before buying {product}',
    'Behind the scenes: how we prepare {product}',
    'Answering the question we get every week',
    'A customer story worth telling',
    'Three signs {audience} needs {product}',
    'What makes our {product} different',
    'Quick tip {audience} can use today',
    'Myth vs reality about {industry}',
    'This week only: {product} highlight',
    'How to choose the right {product}',
    'A day in the life at {business}',
    'What our customers ask before ordering',
    'The small detail nobody notices',
    'Ask us anything — open thread',
  ],
  bn: [
    '{business} এবং এর পেছনের মানুষদের পরিচয়',
    '{product} কেনার আগে ক্রেতারা যে ভুলটা করেন',
    'পর্দার পেছনে: আমরা কীভাবে {product} প্রস্তুত করি',
    'প্রতি সপ্তাহে যে প্রশ্নটা আসে, তার উত্তর',
    'একজন ক্রেতার গল্প',
    '{audience}-এর {product} দরকার — তিনটি লক্ষণ',
    'আমাদের {product} আলাদা কেন',
    '{audience}-এর জন্য আজকের ছোট্ট টিপস',
    '{industry} নিয়ে প্রচলিত ভুল ধারণা',
    'শুধু এই সপ্তাহে: {product}',
    'সঠিক {product} কীভাবে বাছবেন',
    '{business}-এ একটি দিন',
    'অর্ডারের আগে ক্রেতারা যা জিজ্ঞেস করেন',
    'যে ছোট্ট বিষয়টা কেউ খেয়াল করে না',
    'যা খুশি জিজ্ঞেস করুন',
  ],
  banglish: [
    '{business} ar er pechoner manush der porichoy',
    '{product} kenar age customer ra je bhul ta koren',
    'Behind the scenes: amra kivabe {product} prepare kori',
    'Proti shoptahe je prosno ta ashe, tar uttor',
    'Ekjon customer er golpo',
    '{audience} der {product} dorkar — tinta lokkhon',
    'Amader {product} alada keno',
    '{audience} der jonno ajker choto tips',
    '{industry} niye procholito bhul dharona',
    'Shudhu ei shoptahe: {product}',
    'Shothik {product} kivabe bachben',
    '{business} e ekta din',
    'Order er age customer ra ja jiggesh koren',
    'Je choto bishoy ta keu kheyal kore na',
    'Ja khushi jiggesh korun',
  ],
};

const HOOKS: Record<Lang, string[]> = {
  en: [
    'Most people get this wrong on the first try.',
    'We almost never say this out loud, but here it is.',
    'If you have been waiting, this is the week.',
    'One question, asked every single day.',
    'Here is what actually happens before your order arrives.',
    'Save this before you shop again.',
  ],
  bn: [
    'বেশিরভাগ মানুষ প্রথমবারেই এই ভুলটা করেন।',
    'এটা আমরা সচরাচর বলি না, কিন্তু আজ বলছি।',
    'অপেক্ষা করছিলেন? এই সপ্তাহটাই সেই সময়।',
    'একটাই প্রশ্ন, প্রতিদিন আসে।',
    'আপনার অর্ডার পৌঁছানোর আগে আসলে যা হয়।',
    'পরের বার কেনার আগে এটা সেভ করে রাখুন।',
  ],
  banglish: [
    'Beshirbhag manush prothombarei ei bhul ta koren.',
    'Eta amra shochorachor boli na, kintu aj bolchi.',
    'Opekkha korchilen? Ei shoptah tai shei somoy.',
    'Ektai prosno, protidin ashe.',
    'Apnar order pouchanor age ashole ja hoy.',
    'Porer bar kenar age eta save kore rakhun.',
  ],
};

const CTAS: Record<Lang, string[]> = {
  en: ['Send us a message to order.', 'Comment "info" and we will reply.', 'Save this for later.', 'Share with someone who needs it.', 'Tap the link in bio.'],
  bn: ['অর্ডার করতে মেসেজ দিন।', '"info" কমেন্ট করুন, আমরা উত্তর দেব।', 'পরে দেখার জন্য সেভ করুন।', 'যার দরকার তাকে শেয়ার করুন।', 'বায়োর লিংকে ক্লিক করুন।'],
  banglish: ['Order korte message din.', '"info" comment korun, amra reply debo.', 'Pore dekhar jonno save korun.', 'Jar dorkar take share korun.', 'Bio r link e click korun.'],
};

const OBJECTIVE_CYCLE: ContentObjective[] = [
  'awareness',
  'education',
  'engagement',
  'trust',
  'storytelling',
  'education',
  'community',
  'promotion',
  'awareness',
  'education',
  'trust',
  'engagement',
  'storytelling',
  'conversion',
  'community',
];

const TYPE_BY_OBJECTIVE: Record<ContentObjective, ContentType[]> = {
  awareness: ['reel', 'image_post', 'short_video'],
  education: ['carousel', 'image_post', 'text_post'],
  engagement: ['poll', 'story', 'image_post'],
  trust: ['image_post', 'carousel', 'text_post'],
  storytelling: ['reel', 'carousel', 'text_post'],
  promotion: ['image_post', 'story', 'carousel'],
  conversion: ['image_post', 'carousel', 'reel'],
  community: ['story', 'poll', 'text_post'],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function pick<T>(list: T[], index: number): T {
  return list[index % list.length];
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? vars.business ?? 'your brand');
}

function parsePlatforms(text: string): PlatformId[] {
  const lower = text.toLowerCase();
  const found = (Object.keys(PLATFORMS) as PlatformId[]).filter((id) => {
    if (id === 'x') return /\bx\b|twitter/.test(lower);
    return lower.includes(id) || lower.includes(PLATFORMS[id].name.toLowerCase());
  });
  return found;
}

const GENERATE_VERB = /\b(create|generate|make|build|write)\b|তৈরি|বানাও|বানিয়ে/i;

/** Looks for an explicit "create N days, M posts a day" style instruction. */
function parseGenerateCommand(text: string): { days: number; posts_per_day: number } | null {
  if (!GENERATE_VERB.test(text)) return null;

  const daysMatch = text.match(/(\d+)\s*(?:day|days|din|দিন)/i);
  const perDayMatch = text.match(/(\d+)\s*(?:post|posts|পোস্ট)\s*(?:a|per|\/|every)?\s*day|day.*?(\d+)\s*(?:post|posts)/i);
  const plainCountMatch = text.match(/(\d+)\s*(?:post|posts|পোস্ট)/i);

  const days = daysMatch ? Math.min(Math.max(Number(daysMatch[1]), 1), 14) : null;
  const perDay = perDayMatch ? Number(perDayMatch[1] ?? perDayMatch[2]) : null;

  if (days && perDay) {
    return { days, posts_per_day: Math.min(Math.max(perDay, 1), 6) };
  }
  if (days && plainCountMatch) {
    const count = Number(plainCountMatch[1]);
    return { days, posts_per_day: Math.min(Math.max(Math.round(count / days) || 1, 1), 6) };
  }
  if (!days && plainCountMatch) {
    return { days: 1, posts_per_day: Math.min(Math.max(Number(plainCountMatch[1]), 1), 6) };
  }
  return null;
}

function splitList(text: string): string[] {
  return text
    .split(/[,،;\n]|\band\b|\bও\b|\bar\b/gi)
    .map((part) => part.trim())
    .filter((part) => part.length > 1 && part.length < 60)
    .slice(0, 6);
}

function captionFor(lang: Lang, params: {
  topic: string;
  hook: string;
  business: string;
  audience: string;
  product: string;
  objective: ContentObjective;
}): string {
  const { topic, hook, business, audience, product } = params;
  if (lang === 'bn') {
    return `${hook}\n\n${topic}।\n\n${business}-এ আমরা ${audience}-এর জন্য ${product} নিয়ে কাজ করি। আজকের পোস্টে সেই বিষয়টাই একটু খুলে বলছি — কী দেখে বুঝবেন, কী এড়িয়ে চলবেন, আর কোথা থেকে শুরু করবেন।\n\nপ্রশ্ন থাকলে কমেন্টে লিখুন, আমরা উত্তর দেব।`;
  }
  if (lang === 'banglish') {
    return `${hook}\n\n${topic}.\n\n${business} e amra ${audience} der jonno ${product} niye kaj kori. Ajker post e sheita ektu khule bolchi — ki dekhe bujhben, ki eriye cholben, ar kothay theke shuru korben.\n\nProsno thakle comment e likhun, amra reply debo.`;
  }
  return `${hook}\n\n${topic}.\n\nAt ${business} we work with ${audience} on ${product}. Here is the short version: what to look for, what to avoid, and where to start if you are new to this.\n\nQuestions? Leave them in the comments and we will answer.`;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

/**
 * Local placeholder AI used only when no Claude API key is configured.
 *
 * It is deliberately honest: every response it produces is labelled as
 * development output so nothing in the product ever looks like it came from a
 * real model when it did not. The service architecture around it is identical,
 * so adding a key switches the whole app to Claude with no other change.
 */
export class MockAIProvider implements AIProvider {
  readonly id = 'development';
  readonly label = 'Development placeholder';
  readonly isMock = true;
  readonly model = 'local-placeholder';

  async complete(options: AICompleteOptions): Promise<AIResult> {
    const context = options.context ?? {};
    const lang = (context.language as Lang) ?? 'en';
    const text = this.render(options, lang);
    return {
      text,
      provider: this.id,
      model: this.model,
      isMock: true,
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  private render(options: AICompleteOptions, lang: Lang): string {
    switch (options.task) {
      case 'onboarding':
        return JSON.stringify(this.onboarding(options, lang));
      case 'content_idea':
        return JSON.stringify(this.contentIdea(options, lang));
      case 'idea_plan':
        return JSON.stringify(this.ideaPlan(options, lang));
      case 'plan':
        return JSON.stringify(this.plan(options, lang));
      case 'content':
        return JSON.stringify(this.content(options, lang));
      case 'adapt':
        return JSON.stringify(this.adapt(options, lang));
      default:
        return DEV_NOTE[lang];
    }
  }

  /* --- onboarding ------------------------------------------------- */

  private onboarding(options: AICompleteOptions, lang: Lang) {
    const userTurns = options.messages.filter((m) => m.role === 'user');
    const turnIndex = Math.max(0, userTurns.length - 1);
    const latest = userTurns[userTurns.length - 1]?.content ?? '';
    const questions = ONBOARDING_QUESTIONS[lang];

    const business: Record<string, unknown> = {};
    const brand: Record<string, unknown> = {};

    switch (turnIndex) {
      case 0:
        business.description = latest;
        business.business_name = latest.split(/[.,\n]/)[0].slice(0, 60) || null;
        break;
      case 1:
        business.target_audience = latest;
        break;
      case 2: {
        const parts = splitList(latest);
        business.products = parts;
        business.location = parts.length > 1 ? parts[parts.length - 1] : null;
        break;
      }
      case 3:
        business.content_goals = splitList(latest);
        business.business_goals = splitList(latest);
        break;
      case 4: {
        const platforms = parsePlatforms(latest);
        business.preferred_platforms = platforms.length ? platforms : ['facebook', 'instagram'];
        business.posting_frequency = 'daily';
        break;
      }
      default:
        brand.brand_voice = latest;
        brand.personality = splitList(latest);
        brand.preferred_language = lang;
        break;
    }

    const ready = turnIndex >= 5;
    const nextQuestion = ready ? READY_MESSAGE[lang] : pick(questions, turnIndex + 1);

    return {
      reply: `${nextQuestion}\n\n${DEV_NOTE[lang]}`,
      business,
      brand,
      ready,
      missing: ready ? [] : questions.slice(turnIndex + 1).map((_, i) => `step_${turnIndex + i + 2}`),
    };
  }

  /* --- 30 day plan ------------------------------------------------ */

  private plan(options: AICompleteOptions, lang: Lang) {
    const context = options.context ?? {};
    const days = Number(context.days ?? 30);
    const business = String(context.businessName ?? 'your business');
    const audience = String(context.audience ?? (lang === 'bn' ? 'আপনার ক্রেতারা' : 'your customers'));
    const industry = String(context.industry ?? (lang === 'bn' ? 'আপনার খাত' : 'your industry'));
    const productList = Array.isArray(context.products) ? (context.products as string[]) : [];
    const platforms = (Array.isArray(context.platforms) && context.platforms.length
      ? (context.platforms as PlatformId[])
      : (['facebook', 'instagram'] as PlatformId[]));

    const summary =
      lang === 'bn'
        ? `প্রথম সপ্তাহে পরিচিতি ও বিশ্বাস তৈরি, দ্বিতীয় সপ্তাহে শিক্ষামূলক কনটেন্ট, তৃতীয় সপ্তাহে গল্প ও কমিউনিটি, আর শেষ সপ্তাহে অফার। চারটির মধ্যে একটির বেশি সরাসরি বিক্রির পোস্ট রাখা হয়নি। ${DEV_NOTE[lang]}`
        : lang === 'banglish'
          ? `Prothom shoptahe porichiti ar trust, ditiyo shoptahe educational content, tritiyo shoptahe golpo ar community, ar shesh shoptahe offer. Char tar moddhe ek tar beshi direct sales post rakha hoy ni. ${DEV_NOTE[lang]}`
          : `Week one builds awareness and trust, week two teaches, week three tells stories and builds community, week four earns the ask. No more than one in four posts sells directly. ${DEV_NOTE[lang]}`;

    const items = Array.from({ length: days }, (_, index) => {
      const objective = pick(OBJECTIVE_CYCLE, index);
      const contentType = pick(TYPE_BY_OBJECTIVE[objective], index);
      const platform = pick(platforms, index);
      const product = productList.length ? pick(productList, index) : (lang === 'bn' ? 'আমাদের পণ্য' : 'our products');
      const topic = fill(pick(TOPIC_TEMPLATES[lang], index), { business, audience, industry, product });
      const hook = pick(HOOKS[lang], index);
      return {
        day: index + 1,
        topic,
        content_type: contentType,
        platform,
        objective,
        hook,
        caption: captionFor(lang, { topic, hook, business, audience, product, objective }),
        cta: pick(CTAS[lang], index),
        hashtags: [`#${business.replace(/\s+/g, '')}`, `#${industry.replace(/\s+/g, '')}`, '#smallbusiness', '#bangladesh'].slice(
          0,
          PLATFORMS[platform].hashtagSweetSpot[1],
        ),
        image_concept: `${topic} — clean flat-lay of ${product} with soft daylight and brand colours.`,
        video_concept:
          contentType === 'reel' || contentType === 'short_video'
            ? `Open on the hook in text, three quick shots of ${product}, close on the CTA.`
            : null,
        suggested_time: index % 3 === 0 ? '11:00' : index % 3 === 1 ? '18:30' : '20:00',
      };
    });

    return { strategy_summary: summary, days: items };
  }

  /* --- idea plan (from a content-ideas chat) ----------------------- */

  private ideaPlan(options: AICompleteOptions, lang: Lang) {
    const context = options.context ?? {};
    const days = Number(context.days ?? 1);
    const postsPerDay = Number(context.postsPerDay ?? 1);
    const total = days * postsPerDay;
    const business = String(context.businessName ?? 'your business');
    const audience = String(context.audience ?? (lang === 'bn' ? 'আপনার ক্রেতারা' : 'your customers'));
    const industry = String(context.industry ?? (lang === 'bn' ? 'আপনার খাত' : 'your industry'));
    const productList = Array.isArray(context.products) ? (context.products as string[]) : [];
    const platforms = (Array.isArray(context.platforms) && context.platforms.length
      ? (context.platforms as PlatformId[])
      : (['facebook', 'instagram'] as PlatformId[]));
    const dayTimes = ['10:00', '13:00', '16:00', '18:30', '20:00', '21:30'];

    const summary =
      lang === 'bn'
        ? `আপনার চ্যাটে বলা আইডিয়া থেকে ${total}টা পোস্ট তৈরি করা হয়েছে, ${days} দিনে ছড়িয়ে। ${DEV_NOTE[lang]}`
        : lang === 'banglish'
          ? `Apnar chat e bola idea theke ${total} ta post toiri kora hoyeche, ${days} din e chriye. ${DEV_NOTE[lang]}`
          : `${total} posts built from what you shared in chat, spread across ${days} day(s). ${DEV_NOTE[lang]}`;

    const items = Array.from({ length: total }, (_, index) => {
      const dayNumber = (index % days) + 1;
      const slot = Math.floor(index / days);
      const objective = pick(OBJECTIVE_CYCLE, index);
      const contentType = pick(TYPE_BY_OBJECTIVE[objective], index);
      const platform = pick(platforms, index);
      const product = productList.length ? pick(productList, index) : (lang === 'bn' ? 'আমাদের পণ্য' : 'our products');
      const topic = fill(pick(TOPIC_TEMPLATES[lang], index), { business, audience, industry, product });
      const hook = pick(HOOKS[lang], index);
      return {
        day: dayNumber,
        topic,
        content_type: contentType,
        platform,
        objective,
        hook,
        caption: captionFor(lang, { topic, hook, business, audience, product, objective }),
        cta: pick(CTAS[lang], index),
        hashtags: [`#${business.replace(/\s+/g, '')}`, `#${industry.replace(/\s+/g, '')}`, '#smallbusiness'].slice(
          0,
          PLATFORMS[platform].hashtagSweetSpot[1],
        ),
        image_concept: `${topic} — clean flat-lay of ${product} with soft daylight and brand colours.`,
        video_concept:
          contentType === 'reel' || contentType === 'short_video'
            ? `Open on the hook in text, three quick shots of ${product}, close on the CTA.`
            : null,
        suggested_time: pick(dayTimes, slot),
      };
    });

    return { strategy_summary: summary, days: items };
  }

  /* --- content-ideas chat ------------------------------------------ */

  private contentIdea(options: AICompleteOptions, lang: Lang) {
    const latest = options.messages[options.messages.length - 1]?.content ?? '';
    const command = parseGenerateCommand(latest);

    if (command) {
      const ack =
        lang === 'bn'
          ? `ঠিক আছে — ${command.days} দিনে দিনে ${command.posts_per_day}টা করে, মোট ${command.days * command.posts_per_day}টা পোস্ট তৈরি করছি এখন। ${DEV_NOTE[lang]}`
          : lang === 'banglish'
            ? `Thik ache — ${command.days} din e ${command.posts_per_day} ta kore, total ${command.days * command.posts_per_day} ta post toiri korchi ekhon. ${DEV_NOTE[lang]}`
            : `On it — creating ${command.days * command.posts_per_day} posts across ${command.days} day(s), ${command.posts_per_day} per day. ${DEV_NOTE[lang]}`;
      return { reply: ack, mode: 'generate', generate: command };
    }

    const ackChat =
      lang === 'bn'
        ? `নোট করলাম। আরও কিছু বলতে চাইলে বলুন, নাহলে কতগুলো পোস্ট আর কয়দিনের জন্য চান জানান — তখনই তৈরি করা শুরু করব। ${DEV_NOTE[lang]}`
        : lang === 'banglish'
          ? `Note kore rakhlam. Aro kichu bolte chaile bolun, nahole koto ta post ar koidin er jonno chan janan — tokhoni toiri kora shuru korbo. ${DEV_NOTE[lang]}`
          : `Noted. Keep sharing ideas, or tell me how many posts over how many days and I will start creating. ${DEV_NOTE[lang]}`;
    return { reply: ackChat, mode: 'chat', generate: null };
  }

  /* --- single content --------------------------------------------- */

  private content(options: AICompleteOptions, lang: Lang) {
    const context = options.context ?? {};
    const request = options.messages[options.messages.length - 1]?.content ?? '';
    const business = String(context.businessName ?? 'your business');
    const audience = String(context.audience ?? 'your customers');
    const products = Array.isArray(context.products) ? (context.products as string[]) : [];
    const product = products[0] ?? (lang === 'bn' ? 'আমাদের পণ্য' : 'our product');
    const platform = (parsePlatforms(request)[0] ??
      (Array.isArray(context.platforms) && context.platforms.length
        ? (context.platforms as PlatformId[])[0]
        : 'instagram')) as PlatformId;
    const topic = request.slice(0, 80) || pick(TOPIC_TEMPLATES[lang], 0);
    const hook = pick(HOOKS[lang], request.length);

    return {
      topic,
      content_type: 'image_post' as ContentType,
      platform,
      objective: 'promotion' as ContentObjective,
      hook,
      caption: captionFor(lang, { topic, hook, business, audience, product, objective: 'promotion' }),
      cta: pick(CTAS[lang], request.length),
      hashtags: [`#${business.replace(/\s+/g, '')}`, '#offer', '#smallbusiness'],
      image_concept: `${topic} — product hero shot with a short headline overlay.`,
      video_concept: null,
      suggested_time: '19:00',
      note: DEV_NOTE[lang],
    };
  }

  /* --- platform adaptation ---------------------------------------- */

  private adapt(options: AICompleteOptions, lang: Lang) {
    const context = options.context ?? {};
    const platform = (context.platform as PlatformId) ?? 'instagram';
    const meta = PLATFORMS[platform];
    const source = String(context.caption ?? options.messages[0]?.content ?? '');
    const hook = String(context.hook ?? pick(HOOKS[lang], 0));
    const cta = String(context.cta ?? pick(CTAS[lang], 0));

    let caption = source;
    if (platform === 'x') {
      caption = `${hook} ${source.split('\n')[0]}`.slice(0, 260);
    } else if (platform === 'linkedin') {
      caption = `${hook}\n\n${source}\n\n${lang === 'bn' ? 'আপনার অভিজ্ঞতা কী? কমেন্টে জানান।' : 'What has your experience been? I would like to hear it.'}`;
    } else if (platform === 'tiktok') {
      caption = `${hook} ${source.split('\n')[0]}`.slice(0, 150);
    } else {
      caption = source.slice(0, meta.captionLimit);
    }

    const tagCount = meta.hashtagSweetSpot[1];
    const hashtags = Array.isArray(context.hashtags)
      ? (context.hashtags as string[]).slice(0, tagCount)
      : ['#smallbusiness'].slice(0, tagCount);

    return { platform, hook, caption, cta, hashtags };
  }
}
