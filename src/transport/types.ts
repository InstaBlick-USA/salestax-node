import type { SalesTaxError } from '../errors/base.js';

export interface RequestOptions {
  idempotencyKey?: string
  headers?: Record<string, string>
  retryable?: boolean
  signal?: AbortSignal
  /** Request an authorized audit expansion. */
  expand?: 'audit'
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