import { SalesTaxError, type SalesTaxErrorOptions } from './base.js';

export interface ApiErrorOptions extends SalesTaxErrorOptions {
  statusCode: number;
  param?: string;
  retryAfterMs?: number;
}

export class ApiError extends SalesTaxError {
  readonly param?: string;

  constructor(code: string, message: string, options: ApiErrorOptions) {
    super(code, message, options);
    this.param = options.param;
  }
}

export class AuthenticationError extends ApiError {}
export class PermissionError extends ApiError {}
export class ValidationError extends ApiError {}
export class NotFoundError extends ApiError {}
export class ConflictError extends ApiError {}
export class ServerError extends ApiError {}

export class RateLimitError extends ApiError {
  readonly retryAfterMs?: number;

  constructor(code: string, message: string, options: ApiErrorOptions) {
    super(code, message, { ...options, retryable: true });
    this.retryAfterMs = options.retryAfterMs;
  }
}