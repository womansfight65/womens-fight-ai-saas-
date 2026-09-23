import type { LanguageDetection, SupportedLanguage } from '@/types';

/** Bengali Unicode block. Presence of these is decisive. */
const BENGALI_SCRIPT = /[ঀ-৿]/;

/**
 * Romanised Bengali markers. These are function words, pronouns, verb endings
 * and particles that almost never appear in ordinary English, which is what
 * makes "ami online e dress sell kori" separable from an English sentence.
 */
const BANGLISH_MARKERS = [
  // pronouns & possessives
  'ami', 'amar', 'amake', 'amra', 'amader', 'tumi', 'tomar', 'tomake', 'apni', 'apnar',
  'apnader', 'se', 'tar', 'tara', 'tader', 'eta', 'ota', 'eita', 'oita', 'egulo', 'ogulo',
  // verbs
  'kori', 'kori na', 'korchi', 'korbo', 'korte', 'kore', 'korlam', 'kora', 'ache', 'achi',
  'chilo', 'hobe', 'hoy', 'hoyeche', 'hoise', 'dao', 'dibe', 'dite', 'diye', 'nite', 'niye',
  'chai', 'chaile', 'lagbe', 'lage', 'bolo', 'bolen', 'bolte', 'jani', 'jante', 'jabe',
  'thake', 'thaki', 'banao', 'banaben', 'baniye', 'dekhi', 'dekhte', 'pari', 'parbo',
  // particles / connectors
  'kintu', 'tobe', 'jonno', 'jonne', 'karon', 'jodi', 'tahole', 'ar', 'ebong', 'othoba',
  'onek', 'khub', 'aro', 'shudhu', 'matro', 'ekdom', 'mane', 'jemon', 'temon', 'porjonto',
  // question words
  'ki', 'kake', 'keno', 'kobe', 'kothay', 'kivabe', 'kemon', 'koto', 'kon', 'kara',
  // common nouns / adjectives
  'bhalo', 'valo', 'kharap', 'notun', 'purono', 'boro', 'choto', 'dam', 'taka', 'manush',
  'meye', 'meyeder', 'chele', 'cheleder', 'jinis', 'jinish', 'kaj', 'somoy', 'din', 'raat',
  'bari', 'dokan', 'poshak', 'jama', 'kapor', 'khabar', 'ranna', 'bebsha', 'byabsha',
  'grahok', 'customer der', 'bondhu', 'apu', 'bhai', 'vai', 'nai', 'na',
  // Bengali plural / classifier suffixes that survive romanisation
  'gulo', 'guli', 'tuku', 'khana',
];

const BANGLISH_SUFFIX = /\b\w+(er|ta|ti|tuku|gulo|guli|khana|der)\b/gi;

const MARKER_SET = new Set(BANGLISH_MARKERS);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zঀ-৿\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Detects whether the user is writing Bangla, Banglish (Bengali typed in Latin
 * letters) or English. Nothing in the product asks the user to pick a language
 * first — this runs on every message.
 */
export function detectLanguage(text: string): LanguageDetection {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return { language: 'en', confidence: 0, mixed: false };

  const bengaliChars = (trimmed.match(/[ঀ-৿]/g) ?? []).length;
  const latinChars = (trimmed.match(/[A-Za-z]/g) ?? []).length;
  const totalLetters = bengaliChars + latinChars;

  if (bengaliChars > 0 && totalLetters > 0) {
    const ratio = bengaliChars / totalLetters;
    if (ratio >= 0.35) {
      return {
        language: 'bn',
        confidence: Math.min(1, 0.6 + ratio * 0.4),
        mixed: latinChars > 0 && ratio < 0.9,
      };
    }
  }

  const tokens = tokenize(trimmed);
  if (!tokens.length) return { language: 'en', confidence: 0.3, mixed: false };

  let markerHits = 0;
  for (const token of tokens) {
    if (MARKER_SET.has(token)) markerHits += 1;
  }

  const suffixHits = (trimmed.toLowerCase().match(BANGLISH_SUFFIX) ?? []).length;
  const score = (markerHits * 1.4 + suffixHits * 0.5) / tokens.length;

  if (markerHits >= 1 && score >= 0.12) {
    return {
      language: 'banglish',
      confidence: Math.min(1, 0.45 + score),
      mixed: markerHits < tokens.length * 0.6,
    };
  }

  return { language: 'en', confidence: 0.75, mixed: bengaliChars > 0 };
}

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  bn: 'বাংলা',
  banglish: 'Banglish',
};

/** Instruction handed to the model so it answers in the user's own register. */
export function languageInstruction(detection: LanguageDetection): string {
  switch (detection.language) {
    case 'bn':
      return [
        'The user is writing in Bangla (Bengali script).',
        'Reply in natural, warm Bangla using Bengali script.',
        'Keep well-known English business words (post, reel, brand, caption) as they are — that is how people actually speak.',
      ].join(' ');
    case 'banglish':
      return [
        'The user is writing Banglish: Bengali typed with English letters.',
        'Reply in the same Banglish style — Latin letters, Bengali words, friendly and casual.',
        'Do not switch them into Bengali script and do not lecture them about spelling.',
      ].join(' ');
    default:
      return 'The user is writing in English. Reply in clear, friendly English.';
  }
}

/** The language content should be written in, given the brand preference. */
export function resolveContentLanguage(
  brandPreference: SupportedLanguage | null | undefined,
  conversationLanguage: SupportedLanguage,
): SupportedLanguage {
  return brandPreference ?? conversationLanguage;
}
