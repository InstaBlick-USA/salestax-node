import { describe, it, expect } from 'vitest';
import {
  ApiError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  SalesTaxError,
  ServerError,
  ValidationError,
  errorFromResponse,
} from '../../src/index.js';

describe('errorFromResponse', () => {
  it.each([
    [400, ValidationError],
    [401, AuthenticationError],
    [403, ApiError],
    [404, NotFoundError],
    [422, ValidationError],
    [500, ServerError],
    [503, ServerError],
  ])('maps %i to %s', (status, cls) => {
    const err = errorFromResponse(status, { code: 'X', message: 'm' });
    expect(err).toBeInstanceOf(cls);
  });

  it('produces a RateLimitError with retryAfterMs', () => {
    const err = errorFromResponse(429, {}, 'req_1', 5000);
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfterMs).toBe(5000);
    expect(err.retryable).toBe(true);
  });

  it('marks 5xx as retryable', () => {
    expect(errorFromResponse(500, {}).retryable).toBe(true);
  });

  it('uses default code and message on empty body', () => {
    const err = errorFromResponse(418, {});
    expect(err.code).toBe('HTTP_418');
    expect(err.message).toContain('418');
  });
});

describe('SalesTaxError hierarchy', () => {
  it('has correct prototype chain', () => {
    expect(new ApiError('X', 'y', { statusCode: 400 })).toBeInstanceOf(SalesTaxError);
    expect(new RateLimitError('X', 'y', { statusCode: 429 })).toBeInstanceOf(ApiError);
  });

  it('preserves .name after subclassing', () => {
    expect(new ValidationError('X', 'y', { statusCode: 400 }).name).toBe('ValidationError');
  });
});