import type { SalesTaxError } from '../errors/base.js';

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

export interface RequestInfo {
  method: string;
  url: string;
  attempt: number;
}

export interface ResponseInfo {
  status: number;
  url: string;
  durationMs: number;
  requestId?: string;
}

export interface RetryInfo {
  attempt: number;
  delayMs: number;
  error: SalesTaxError;
}

export interface Hooks {
  onRequest?: (info: RequestInfo) => void;
  onResponse?: (info: ResponseInfo) => void;
  onRetry?: (info: RetryInfo) => void;
}