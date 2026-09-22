// src/errors/api-error.ts
import { SalesTaxError } from './base';

export class ApiError extends SalesTaxError {
  readonly param?: string;
  constructor(
    code: string,
    message: string,
    opts: { statusCode: number; requestId?: string; retryable?: boolean; param?: string },
  ) {
    super(code, message, opts);
    this.param = opts.param;
  }
}

export class AuthenticationError extends ApiError {}      // 401
export class PermissionError     extends ApiError {}      // 403
export class ValidationError     extends ApiError {}      // 400, 422
export class NotFoundError       extends ApiError {}      // 404
export class ConflictError       extends ApiError {}      // 409
export class RateLimitError      extends ApiError {       // 429
  readonly retryAfterMs?: number;
  constructor(code: string, message: string, opts: ConstructorParameters<typeof ApiError>[2] & { retryAfterMs?: number }) {
    super(code, message, { ...opts, retryable: true });
    this.retryAfterMs = opts.retryAfterMs;
  }
}
export class ServerError extends ApiError {}              // 5xx