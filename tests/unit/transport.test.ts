import { describe, it, expect } from 'vitest';
import {
  RateLimitError,
  SalesTaxClient,
  ServerError,
  TimeoutError,
  ValidationError,
} from '../../src/index.js';
import { makeMockFetch } from './helpers.js';

describe('HttpClient', () => {
  it('sends auth, UA, and content-type headers', async () => {
    const { fn, calls } = makeMockFetch([{ status: 200, body: { taxAmount: 9.75 } }]);
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn });

    await client.tax.calculate({ zipCode: '90210', amount: 100 });

    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer sk_test');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['User-Agent']).toMatch(/^salestax-node\//);
  });

  it('retries on 500 then succeeds', async () => {
    const { fn, calls } = makeMockFetch([
      { status: 500, body: { code: 'SERVER' } },
      { status: 200, body: { taxAmount: 9.75 } },
    ]);
    const client = new SalesTaxClient({
      apiKey: 'sk_test',
      fetch: fn,
      retry: { maxRetries: 2, initialDelayMs: 0, jitter: false },
    });

    const res = await client.tax.calculate({ zipCode: '90210', amount: 100 });
    expect(res.taxAmount).toBe(9.75);
    expect(calls.length).toBe(2);
  });

  it('does not retry 400 validation errors', async () => {
    const { fn, calls } = makeMockFetch([
      { status: 400, body: { code: 'BAD', message: 'nope' } },
    ]);
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn });

    await expect(client.tax.calculate({ zipCode: '90210', amount: 100 }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(calls.length).toBe(1);
  });

  it('honors Retry-After on 429', async () => {
    const { fn, calls } = makeMockFetch([
      { status: 429, headers: { 'retry-after': '0' }, body: { code: 'RATE_LIMITED' } },
      { status: 200, body: { taxAmount: 9.75 } },
    ]);
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn });

    await client.tax.calculate({ zipCode: '90210', amount: 100 });
    expect(calls.length).toBe(2);
  });

  it('surfaces retryAfterMs on RateLimitError', async () => {
    const { fn } = makeMockFetch([
      { status: 429, headers: { 'retry-after': '2' }, body: { code: 'RATE_LIMITED' } },
    ]);
    const client = new SalesTaxClient({
      apiKey: 'sk_test',
      fetch: fn,
      retry: { maxRetries: 0 },
    });

    try {
      await client.tax.calculate({ zipCode: '90210', amount: 100 });
      throw new Error('expected RateLimitError');
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfterMs).toBe(2000);
    }
  });

  it('maps AbortError to TimeoutError', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const { fn } = makeMockFetch([{ throw: abort }]);
    const client = new SalesTaxClient({
      apiKey: 'sk_test',
      fetch: fn,
      retry: { maxRetries: 0 },
    });

    await expect(client.tax.calculate({ zipCode: '90210', amount: 100 }))
      .rejects.toBeInstanceOf(TimeoutError);
  });

  it('surfaces request id from response headers', async () => {
    const { fn } = makeMockFetch([
      { status: 500, headers: { 'x-request-id': 'req_abc' }, body: {} },
    ]);
    const client = new SalesTaxClient({
      apiKey: 'sk_test',
      fetch: fn,
      retry: { maxRetries: 0 },
    });

    try {
      await client.tax.calculate({ zipCode: '90210', amount: 100 });
      throw new Error('expected ServerError');
    } catch (err) {
      expect(err).toBeInstanceOf(ServerError);
      expect((err as ServerError).requestId).toBe('req_abc');
    }
  });

  it('sets Idempotency-Key header when provided', async () => {
    const { fn, calls } = makeMockFetch([{ status: 200, body: { count: 0, results: [] } }]);
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn });

    await client.tax.calculateBatch(
      [{ zipCode: '90210', amount: 1 }],
      { idempotencyKey: 'order-123' },
    );

    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe('order-123');
  });

  it('omits Idempotency-Key header when not provided', async () => {
    const { fn, calls } = makeMockFetch([{ status: 200, body: { taxAmount: 1 } }]);
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn });

    await client.tax.calculate({ zipCode: '90210', amount: 100 });

    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeUndefined();
    });
});