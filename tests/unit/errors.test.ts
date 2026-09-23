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
} from '../../src/index';

describe('errorFromResponse', () => {
  it.each([
    [400, ValidationError],
    [401, AuthenticationError],
    [403, ApiError],
    [404, NotFoundError],
    [409, ApiError],
    [422, ValidationError],
    [500, ServerError],
    [503, ServerError],
  ])('maps %i to %s', (status, cls) => {
    const err = errorFromResponse(status, { code: 'invalid_request', detail: 'm' });
    expect(err).toBeInstanceOf(cls);
  });

  it('produces a RateLimitError with retryAfterMs from body', () => {
    const err = errorFromResponse(429, { retry_after_seconds: 5 });
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfterMs).toBe(5000);
    expect(err.retryable).toBe(true);
  });

  it('prefers header retry-after over body', () => {
    const err = errorFromResponse(429, { retry_after_seconds: 5 }, undefined, 2000);
    expect((err as RateLimitError).retryAfterMs).toBe(2000);
  });

  it('marks 5xx as retryable', () => {
    expect(errorFromResponse(500, {}).retryable).toBe(true);
  });

  it('reads request_id from body when no header', () => {
    const err = errorFromResponse(500, { request_id: 'req_body' });
    expect(err.requestId).toBe('req_body');
  });

  it('prefers header request_id', () => {
    const err = errorFromResponse(500, { request_id: 'req_body' }, 'req_header');
    expect(err.requestId).toBe('req_header');
  });

  it('extracts param from errors[0].pointer', () => {
    const err = errorFromResponse(400, { errors: [{ pointer: '/lines/0/amount' }] });
    expect(err.param).toBe('/lines/0/amount');
  });

  it('falls back to title when detail absent', () => {
    const err = errorFromResponse(400, { title: 'Invalid request' });
    expect(err.message).toBe('Invalid request');
  });

  it('uses HTTP_status code when body has no code', () => {
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