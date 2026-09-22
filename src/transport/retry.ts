import type { RetryPolicy } from '../config.js';

/** Return the delay in milliseconds before retry `attempt` (0-indexed). */
export function computeDelayMs(
  attempt: number,
  policy: RetryPolicy,
  retryAfterMs?: number,
): number {
  if (retryAfterMs != null) return Math.max(0, retryAfterMs);

  const exponential = policy.initialDelayMs * Math.pow(policy.backoffFactor, attempt);
  const capped = Math.min(exponential, policy.maxDelayMs);
  return policy.jitter ? Math.floor(Math.random() * capped) : Math.floor(capped);
}

/**
 * Parse a `Retry-After` header into milliseconds.
 * Supports both the delay-seconds and HTTP-date forms per RFC 7231.
 */
export function parseRetryAfter(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1000;

  const when = Date.parse(trimmed);
  if (Number.isNaN(when)) return undefined;
  return Math.max(0, when - Date.now());
}