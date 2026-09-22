import { describe, it, expect } from 'vitest';
import { computeDelayMs, parseRetryAfter } from '../../src/transport/retry';
import { DEFAULT_RETRY } from '../../src/config';

describe('computeDelayMs', () => {
  it('returns retryAfterMs when provided', () => {
    expect(computeDelayMs(3, DEFAULT_RETRY, 1234)).toBe(1234);
  });

  it('grows exponentially without jitter', () => {
    const policy = {
      ...DEFAULT_RETRY,
      initialDelayMs: 100,
      backoffFactor: 2,
      jitter: false,
      maxDelayMs: 10_000,
    };
    expect(computeDelayMs(0, policy)).toBe(100);
    expect(computeDelayMs(1, policy)).toBe(200);
    expect(computeDelayMs(2, policy)).toBe(400);
  });

  it('caps at maxDelayMs', () => {
    const policy = {
      ...DEFAULT_RETRY,
      initialDelayMs: 100,
      backoffFactor: 10,
      maxDelayMs: 500,
      jitter: false,
    };
    expect(computeDelayMs(5, policy)).toBe(500);
  });

  it('applies jitter within [0, capped]', () => {
    const policy = {
      ...DEFAULT_RETRY,
      initialDelayMs: 1000,
      jitter: true,
      maxDelayMs: 1000,
    };
    for (let i = 0; i < 50; i++) {
      const delay = computeDelayMs(0, policy);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(1000);
    }
  });
});

describe('parseRetryAfter', () => {
  it('parses seconds', () => {
    expect(parseRetryAfter('3')).toBe(3000);
  });

  it('parses HTTP-date in the future', () => {
    const future = new Date(Date.now() + 5000).toUTCString();
    const result = parseRetryAfter(future);
    expect(result).toBeDefined();
    expect(result!).toBeGreaterThan(0);
  });

  it('returns undefined for garbage', () => {
    expect(parseRetryAfter('not-a-date')).toBeUndefined();
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter(undefined)).toBeUndefined();
  });

  it('clamps past HTTP-date to zero', () => {
    const past = new Date(Date.now() - 10_000).toUTCString();
    expect(parseRetryAfter(past)).toBe(0);
  });
});