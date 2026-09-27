/**
 * A URL env var that is unset, empty, whitespace-only, or malformed must
 * never crash a build or a request — it falls back instead. `??` alone does
 * not catch an env var that exists but is set to an empty string, which is
 * exactly what took down `new URL(...)` in production once before.
 */
export function safeSiteUrl(value: string | undefined | null, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  try {
    // eslint-disable-next-line no-new -- validation only, the URL object itself is discarded
    new URL(trimmed);
    return trimmed;
  } catch {
    return fallback;
  }
}
