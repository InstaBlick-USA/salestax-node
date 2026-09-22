// src/errors/base.ts
export class SalesTaxError extends Error {
  readonly code: string;
  readonly requestId?: string;
  readonly statusCode?: number;
  readonly retryable: boolean;

  constructor(
    code: string,
    message: string,
    opts: { statusCode?: number; requestId?: string; retryable?: boolean } = {},
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = opts.statusCode;
    this.requestId = opts.requestId;
    this.retryable = opts.retryable ?? false;
    Error.captureStackTrace?.(this, new.target);
  }
}