/**
 * Base class for every error the SDK raises.
 */

export interface SalesTaxErrorOptions {
  statusCode?: number;
  requestId?: string;
  retryable?: boolean;
}

export class SalesTaxError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly requestId?: string;
  readonly retryable: boolean;

  constructor(code: string, message: string, options: SalesTaxErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = options.statusCode;
    this.requestId = options.requestId;
    this.retryable = options.retryable ?? false;
    // V8-specific, but harmless if unavailable.
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, new.target);
    }
  }
}