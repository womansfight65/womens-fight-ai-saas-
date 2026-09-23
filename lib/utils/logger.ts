import 'server-only';

import type { LogLevel } from '@/types';

const REDACTED = '[redacted]';
const SENSITIVE_KEYS = /(key|token|secret|password|authorization|cookie)/i;

/** Strips anything that looks like a credential before a log is persisted. */
export function safeMetadata(input: Record<string, unknown> = {}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEYS.test(key)) {
      out[key] = REDACTED;
    } else if (typeof value === 'string' && value.length > 500) {
      out[key] = `${value.slice(0, 500)}…`;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = safeMetadata(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function write(
  level: LogLevel,
  scope: string,
  message: string,
  metadata: Record<string, unknown> = {},
) {
  const safe = safeMetadata(metadata);
  const workspaceId = typeof safe.workspaceId === 'string' ? safe.workspaceId : null;
  try {
    const { getStore } = await import('@/lib/data');
    const store = await getStore();
    await store.addLog({ level, scope, message, workspace_id: workspaceId, metadata: safe });
  } catch {
    // Logging must never break a request.
  }
  if (process.env.NODE_ENV !== 'production') {
    const line = `[${scope}] ${message}`;
    if (level === 'error') console.error(line, safe);
    else if (level === 'warn') console.warn(line, safe);
  }
}

export const logger = {
  debug: (scope: string, message: string, metadata?: Record<string, unknown>) =>
    write('debug', scope, message, metadata),
  info: (scope: string, message: string, metadata?: Record<string, unknown>) =>
    write('info', scope, message, metadata),
  warn: (scope: string, message: string, metadata?: Record<string, unknown>) =>
    write('warn', scope, message, metadata),
  error: (scope: string, message: string, metadata?: Record<string, unknown>) =>
    write('error', scope, message, metadata),
};
