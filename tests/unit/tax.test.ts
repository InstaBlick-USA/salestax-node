import { describe, it, expect } from 'vitest';
import { SalesTaxClient, ValidationError } from '../../src/index.js';
import { makeMockFetch } from './helpers.js';

function makeClient(responses: Parameters<typeof makeMockFetch>[0] = []) {
  const { fn, calls } = makeMockFetch(responses);
  const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn });
  return { client, fn, calls };
}

describe('TaxResource', () => {
  it('rejects negative amounts', async () => {
    const { client } = makeClient();
    await expect(client.tax.calculate({ zipCode: '90210', amount: -1 }))
      .rejects.toMatchObject({ code: 'INVALID_AMOUNT', param: 'amount' });
  });

  it('rejects missing zip', async () => {
    const { client } = makeClient();
    await expect(client.tax.calculate({ zipCode: '', amount: 1 }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects empty batch', async () => {
    const { client } = makeClient();
    await expect(client.tax.calculateBatch([]))
      .rejects.toMatchObject({ code: 'EMPTY_BATCH' });
  });

  it('rejects oversized batch without chunkBatch', async () => {
    const { client } = makeClient();
    const big = Array.from({ length: 101 }, () => ({ zipCode: '90210', amount: 1 }));
    await expect(client.tax.calculateBatch(big))
      .rejects.toMatchObject({ code: 'BATCH_LIMIT_EXCEEDED' });
  });

  it('calculateBatchChunked splits inputs >100', async () => {
    const { client, calls } = makeClient([
      { status: 200, body: { count: 100, results: [] } },
      { status: 200, body: { count: 5, results: [] } },
    ]);
    const txns = Array.from({ length: 105 }, () => ({ zipCode: '90210', amount: 1 }));
    const res = await client.tax.calculateBatchChunked(txns);
    expect(res.count).toBe(0);
    expect(calls.length).toBe(2);
  });

  it('sends state/country/city when provided', async () => {
    const { client, calls } = makeClient([{ status: 200, body: {} }]);
    await client.tax.calculate({
      zipCode: '90210',
      amount: 100,
      state: 'CA',
      country: 'US',
      city: 'Beverly Hills',
    });
    const body = JSON.parse(calls[0]!.init.body as string);
    expect(body.state).toBe('CA');
    expect(body.country).toBe('US');
    expect(body.city).toBe('Beverly Hills');
  });

  it('rates.get encodes zipCode', async () => {
    const { client, calls } = makeClient([{ status: 200, body: { rate: 0.0975 } }]);
    await client.rates.get('90210');
    expect(calls[0]!.url).toMatch(/\/rates\/90210$/);
  });

  it('jurisdictions.list builds query string', async () => {
    const { client, calls } = makeClient([{ status: 200, body: [] }]);
    await client.jurisdictions.list({ country: 'US', state: 'CA' });
    expect(calls[0]!.url).toMatch(/\/jurisdictions\?country=US&state=CA$/);
  });

  it('jurisdictions.list omits empty query', async () => {
    const { client, calls } = makeClient([{ status: 200, body: [] }]);
    await client.jurisdictions.list();
    expect(calls[0]!.url).toMatch(/\/jurisdictions$/);
  });
  it('rates.get rejects missing zip', async () => {
    const { client } = makeClient();
    await expect(client.rates.get('')).rejects.toMatchObject({
        code: 'MISSING_PARAM',
        param: 'zipCode',
    });
    });
});