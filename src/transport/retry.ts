import type { RetryOptions } from '../config';

export function computeDelay(attempt: number, opts: RetryOptions, retryAfterMs?: number): number {
  if (retryAfterMs != null) return retryAfterMs;
  const exp = opts.initialDelayMs * Math.pow(opts.backoffFactor, attempt);
  const capped = Math.min(exp, opts.maxDelayMs);
  return opts.jitter ? Math.random() * capped : capped;
}

export function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}