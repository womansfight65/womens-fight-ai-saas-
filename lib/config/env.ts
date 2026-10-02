/**
 * Single source of truth for "what is actually configured in this deployment".
 *
 * The product rule is that nothing is ever presented as connected when it is
 * not. Every integration answers here, and the UI reads these flags to decide
 * between a real feature, a development-mode notice, or a Coming Soon state.
 */

import { safeSiteUrl } from '@/lib/utils/url';

function has(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * `NODE_ENV` is `'production'` for both Preview and Production builds on
 * Vercel — it cannot tell them apart. `VERCEL_ENV` is Vercel's own signal
 * ('production' | 'preview' | 'development') and is what actually
 * distinguishes a real production deploy from everything else (preview
 * deploys, and local dev where it is unset).
 */
const isProductionEnv = process.env.VERCEL_ENV === 'production';

/**
 * Explicit escape hatch: TikTok's Sandbox Target User flow is tested
 * through the registered production callback URL, so the automatic
 * "production deploy -> Production app" rule below has to be overridable
 * for the one deployment that visitors actually reach. Setting this to
 * 'true' on the Production environment (temporarily, during Sandbox
 * testing) forces Sandbox credentials there too; left unset, Production
 * always uses the Production app, same as before this existed.
 */
const forceTiktokSandbox = process.env.TIKTOK_FORCE_SANDBOX === 'true';

/**
 * TikTok only: Production app credentials are used on a real production
 * deploy. Everywhere else (preview deploys, local dev) the Sandbox app
 * credentials are used instead, so testing against TikTok's Sandbox never
 * touches the Production app's audited scopes or its Target User
 * allowlist. Falls back to the Production credentials if no Sandbox
 * credentials are configured, so nothing silently breaks where only one
 * set has been set up.
 */
function tiktokCredential(prodVar: string, sandboxVar: string): string {
  const prod = process.env[prodVar] ?? '';
  const sandbox = process.env[sandboxVar] ?? '';
  if (isProductionEnv && !forceTiktokSandbox) return prod;
  return has(sandbox) ? sandbox : prod;
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  claudeApiKey: process.env.CLAUDE_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? '',
  claudeModel: process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-5',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  imageProviderKey: process.env.IMAGE_PROVIDER_API_KEY ?? '',
  videoProviderKey: process.env.VIDEO_PROVIDER_API_KEY ?? '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  siteUrl: safeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000'),
  facebookAppId: process.env.FACEBOOK_APP_ID ?? '',
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET ?? '',
  instagramAppId: process.env.INSTAGRAM_APP_ID ?? '',
  instagramAppSecret: process.env.INSTAGRAM_APP_SECRET ?? '',
  tiktokClientKey: tiktokCredential('TIKTOK_CLIENT_KEY', 'TIKTOK_SANDBOX_CLIENT_KEY'),
  tiktokClientSecret: tiktokCredential('TIKTOK_CLIENT_SECRET', 'TIKTOK_SANDBOX_CLIENT_SECRET'),
  /** True when this deployment is actually running on the TikTok Sandbox app, not Production. */
  tiktokUsingSandbox: (!isProductionEnv || forceTiktokSandbox) && has(process.env.TIKTOK_SANDBOX_CLIENT_KEY),
};

const facebookConfigured = has(env.facebookAppId) && has(env.facebookAppSecret);
const instagramConfigured = has(env.instagramAppId) && has(env.instagramAppSecret);
const tiktokConfigured = has(env.tiktokClientKey) && has(env.tiktokClientSecret);

export const integrations = {
  /** Supabase Auth + Postgres. When false the app runs on the local dev store. */
  supabase: has(env.supabaseUrl) && has(env.supabaseAnonKey),
  supabaseAdmin: has(env.supabaseServiceRoleKey),
  /** Claude API. When false the app uses the clearly-labelled mock AI provider. */
  claude: has(env.claudeApiKey),
  openai: has(env.openaiApiKey),
  /** True once a real text-generation provider (Claude or OpenAI) is configured. */
  get ai() {
    return this.claude || this.openai;
  },
  imageGeneration: has(env.imageProviderKey),
  videoGeneration: has(env.videoProviderKey),
  billing: has(env.stripeSecretKey),
  facebook: facebookConfigured,
  instagram: instagramConfigured,
  tiktok: tiktokConfigured,
  /** True once at least one social platform has real app credentials. */
  social: facebookConfigured || instagramConfigured || tiktokConfigured,
};

export type IntegrationKey = keyof typeof integrations;

/** True when at least one core integration is missing. */
export const isDevelopmentMode = !integrations.supabase || !integrations.ai;

export const PUBLIC_INTEGRATIONS = {
  claude: integrations.claude,
  openai: integrations.openai,
  ai: integrations.ai,
  supabase: integrations.supabase,
  imageGeneration: integrations.imageGeneration,
  videoGeneration: integrations.videoGeneration,
  billing: integrations.billing,
  social: integrations.social,
};
