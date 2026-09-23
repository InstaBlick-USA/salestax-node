import { describe, it, expect } from 'vitest';
import {
  RateLimitError,
  SalesTaxClient,
  ServerError,
  TimeoutError,
  ValidationError,
} from '../../src/index';
import { makeMockFetch } from './helpers';

const validParams = {
  currency: 'CAD',
  tax_behavior: 'exclusive' as const,
  billing_event: 'subscription_start' as const,
  seller: {
    country: 'CA',
    channel_role: 'direct_legal_supplier' as const,
    registrations: [
      { country: 'CA', state: 'ON', type: 'gst_hst', effective_from: '2026-01-01' },
    ],
  },
  customer: {
    type: 'consumer' as const,
    address: { country: 'CA', state: 'ON', postal_code: 'M5V 2T6' },
  },
  lines: [{ reference: 'subscription', amount: '100.00', tax_code: 'saas' }],
};

function makeClient(
  responses: Parameters<typeof makeMockFetch>[0] = [],
  opts: Record<string, unknown> = {},
) {
  const { fn, calls } = makeMockFetch(responses);
  const client = new SalesTaxClient({ apiKey: 'stca_test', fetch: fn, ...opts });
  return { client, fn, calls };
}

describe('HttpClient', () => {
  it('sends auth and UA headers', async () => {
    const { client, calls } = makeClient([{ status: 201, body: { id: 'calc_1' } }]);
    await client.calculations.create(validParams);
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer stca_test');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['User-Agent']).toMatch(/^salestax-node\//);
  });

  it('retries on 500 then succeeds', async () => {
    const { client, calls } = makeClient(
      [
        { status: 500, body: { code: 'internal_error' } },
        { status: 201, body: { id: 'calc_1' } },
      ],
      { retry: { maxRetries: 2, initialDelayMs: 0, jitter: false } },
    );
    await client.calculations.create(validParams);
    expect(calls.length).toBe(2);
  });

  it('does not retry 400 validation errors', async () => {
    const { client, calls } = makeClient([
      { status: 400, body: { code: 'invalid_request', detail: 'bad' } },
    ]);
    await expect(client.calculations.create(validParams)).rejects.toBeInstanceOf(ValidationError);
    expect(calls.length).toBe(1);
  });

  it('honors Retry-After on 429', async () => {
    const { client, calls } = makeClient([
      { status: 429, headers: { 'retry-after': '0' }, body: { code: 'rate_limit_exceeded' } },
      { status: 201, body: { id: 'calc_1' } },
    ]);
    await client.calculations.create(validParams);
    expect(calls.length).toBe(2);
  });

  it('surfaces retry_after_seconds from body', async () => {
    const { client } = makeClient(
      [{ status: 429, body: { code: 'rate_limit_exceeded', retry_after_seconds: 2 } }],
      { retry: { maxRetries: 0 } },
    );
    try {
      await client.calculations.create(validParams);
      throw new Error('expected RateLimitError');
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfterMs).toBe(2000);
    }
  });

  it('maps AbortError to TimeoutError', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const { client } = makeClient([{ throw: abort }], { retry: { maxRetries: 0 } });
    await expect(client.calculations.create(validParams)).rejects.toBeInstanceOf(TimeoutError);
  });

  it('surfaces request_id from body', async () => {
    const { client } = makeClient(
      [{ status: 500, body: { code: 'internal_error', request_id: 'req_abc' } }],
      { retry: { maxRetries: 0 } },
    );
    try {
      await client.calculations.create(validParams);
      throw new Error('expected ServerError');
    } catch (err) {
      expect(err).toBeInstanceOf(ServerError);
      expect((err as ServerError).requestId).toBe('req_abc');
    }
  });

  it('surfaces request id from response headers', async () => {
    const { client } = makeClient(
      [{ status: 500, headers: { 'x-request-id': 'req_hdr' }, body: {} }],
      { retry: { maxRetries: 0 } },
    );
    try {
      await client.calculations.create(validParams);
      throw new Error('expected ServerError');
    } catch (err) {
      expect(err).toBeInstanceOf(ServerError);
      expect((err as ServerError).requestId).toBe('req_hdr');
    }
  });

  it('surfaces field pointer from problem errors array', async () => {
    const { client } = makeClient([
      {
        status: 400,
        body: {
          code: 'invalid_request',
          detail: 'amount must be a decimal string',
          errors: [{ pointer: '/lines/0/amount', message: 'invalid' }],
        },
      },
    ]);
    try {
      await client.calculations.create(validParams);
      throw new Error('expected ValidationError');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).param).toBe('/lines/0/amount');
    }
  });

  it('sets Idempotency-Key header when provided', async () => {
    const { client, calls } = makeClient([{ status: 201, body: { id: 'calc_1' } }]);
    await client.calculations.create(validParams, { idempotencyKey: 'order-12345' });
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe('order-12345');
  });

  it('omits Idempotency-Key header when not provided', async () => {
    const { client, calls } = makeClient([{ status: 201, body: { id: 'calc_1' } }]);
    await client.calculations.create(validParams);
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeUndefined();
  });

  it('appends expand=audit when requested', async () => {
    const { client, calls } = makeClient([{ status: 201, body: { id: 'calc_1' } }]);
    await client.calculations.create(validParams, { expand: 'audit' });
    expect(calls[0]!.url).toContain('expand=audit');
  });

  it('uses DEFAULT_BASE_URL without /v1 suffix', async () => {
    const { client, calls } = makeClient([{ status: 201, body: { id: 'calc_1' } }]);
    await client.calculations.create(validParams);
    expect(calls[0]!.url).toBe(
      'https://api.salestaxcalculatorapi.com/v1/calculations',
    );
  });
});