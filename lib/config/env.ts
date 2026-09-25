/**
 * Single source of truth for "what is actually configured in this deployment".
 *
 * The product rule is that nothing is ever presented as connected when it is
 * not. Every integration answers here, and the UI reads these flags to decide
 * between a real feature, a development-mode notice, or a Coming Soon state.
 */

function has(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  claudeApiKey: process.env.CLAUDE_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? '',
  claudeModel: process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-5',
  imageProviderKey: process.env.IMAGE_PROVIDER_API_KEY ?? '',
  videoProviderKey: process.env.VIDEO_PROVIDER_API_KEY ?? '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  facebookAppId: process.env.FACEBOOK_APP_ID ?? '',
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET ?? '',
};

const facebookConfigured = has(env.facebookAppId) && has(env.facebookAppSecret);

export const integrations = {
  /** Supabase Auth + Postgres. When false the app runs on the local dev store. */
  supabase: has(env.supabaseUrl) && has(env.supabaseAnonKey),
  supabaseAdmin: has(env.supabaseServiceRoleKey),
  /** Claude API. When false the app uses the clearly-labelled mock AI provider. */
  claude: has(env.claudeApiKey),
  imageGeneration: has(env.imageProviderKey),
  videoGeneration: has(env.videoProviderKey),
  billing: has(env.stripeSecretKey),
  facebook: facebookConfigured,
  /** True once at least one social platform has real app credentials. */
  social: facebookConfigured,
};

export type IntegrationKey = keyof typeof integrations;

/** True when at least one core integration is missing. */
export const isDevelopmentMode = !integrations.supabase || !integrations.claude;

export const PUBLIC_INTEGRATIONS = {
  claude: integrations.claude,
  supabase: integrations.supabase,
  imageGeneration: integrations.imageGeneration,
  videoGeneration: integrations.videoGeneration,
  billing: integrations.billing,
  social: integrations.social,
};
