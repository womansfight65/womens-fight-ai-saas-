import { randomUUID, randomBytes } from 'crypto';

export function uuid(): string {
  try {
    return randomUUID();
  } catch {
    return randomBytes(16).toString('hex');
  }
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
  return base || 'workspace';
}

export function shortId(length = 6): string {
  return randomBytes(length).toString('hex').slice(0, length);
}
