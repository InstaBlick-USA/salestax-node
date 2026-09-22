import { SalesTaxError } from './base.js';

export class ConnectionError extends SalesTaxError {
  constructor(message: string, code = 'CONNECTION_ERROR', retryable = true) {
    super(code, message, { retryable });
  }
}

export class TimeoutError extends ConnectionError {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`, 'TIMEOUT');
  }
}