// tests/unit/client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { SalesTaxClient, RateLimitError, ValidationError } from '../../src';

function mockFetch(responses: Array<Partial<Response> & { json?: () => unknown }>) {
  let i = 0;
  return vi.fn(async () => {
    const r = responses[i++];
    return {
      ok: r.status! < 400,
      status: r.status ?? 200,
      headers: new Headers(r.headers as HeadersInit ?? {}),
      json: async () => r.json ?? {},
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

describe('SalesTaxClient', () => {
  it('calculates tax', async () => {
    const fetchImpl = mockFetch([{
      status: 200,
      json: () => ({ taxAmount: 9.75, totalAmount: 109.75, rate: 0.0975 }),
    }]);
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fetchImpl });
    const res = await client.tax.calculate({ zipCode: '90210', amount: 100 });
    expect(res.taxAmount).toBe(9.75);
  });

  it('maps 429 to RateLimitError and retries', async () => {
    const fetchImpl = mockFetch([
      { status: 429, headers: { 'retry-after': '0' }, json: () => ({ code: 'RATE_LIMITED' }) },
      { status: 200, json: () => ({ taxAmount: 9.75 }) },
    ]);
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fetchImpl });
    const res = await client.tax.calculate({ zipCode: '90210', amount: 100 });
    expect(res.taxAmount).toBe(9.75);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid amount before hitting network', async () => {
    const fetchImpl = mockFetch([]);
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fetchImpl });
    await expect(client.tax.calculate({ zipCode: '90210', amount: -1 }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('throws when batch exceeds 100 without chunkBatch', async () => {
    const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: mockFetch([]) });
    const big = Array.from({ length: 101 }, () => ({ zipCode: '90210', amount: 1 }));
    await expect(client.tax.calculateBatch(big)).rejects.toThrow(/BATCH_LIMIT/);
  });
});