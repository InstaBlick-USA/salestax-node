import type { SalesTaxError } from '../errors';

export interface RequestOptions {
  /** Correlation key for safe retries on POST. */
  idempotencyKey?: string;
  /** Per-request header overrides. */
  headers?: Record<string, string>;
  /** Disable retries for this request only. */
  retryable?: boolean;
  /** Caller-supplied abort signal. */
  signal?: AbortSignal;
}

export interface Hooks {
  onRequest?: (info: { method: string; url: string; attempt: number }) => void;
  onResponse?: (info: {
    status: number; url: string; durationMs: number; requestId?: string;
  }) => void;
  onRetry?: (info: { attempt: number; delayMs: number; error: SalesTaxError }) => void;
}