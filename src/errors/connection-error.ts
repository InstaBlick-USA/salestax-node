// src/errors/connection-error.ts
import { SalesTaxError } from './base';

export class ConnectionError extends SalesTaxError {
  constructor(message: string, opts: { code?: string; retryable?: boolean } = {}) {
    super(opts.code ?? 'CONNECTION_ERROR', message, { retryable: opts.retryable ?? true });
  }
}

export class TimeoutError extends ConnectionError {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`, { code: 'TIMEOUT' });
  }
}