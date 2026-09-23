import { describe, it, expect } from 'vitest';
import { SalesTaxClient, ValidationError } from '../../src/index';
import { makeMockFetch } from './helpers';

function makeClient(responses: Parameters<typeof makeMockFetch>[0] = []) {
  const { fn, calls } = makeMockFetch(responses);
  const client = new SalesTaxClient({ apiKey: 'stca_test', fetch: fn });
  return { client, fn, calls };
}

describe('CoverageResource', () => {
  it('checks coverage', async () => {
    const { client, calls } = makeClient([
      { status: 200, body: { object: 'coverage', qualification: 'qualified' } },
    ]);
    await client.coverage.check({
      country: 'CA',
      state: 'ON',
      tax_code: 'saas',
      transaction_type: 'sale',
    });
    const url = calls[0]!.url;
    expect(url).toMatch(/\/v1\/coverage\?/);
    expect(url).toContain('country=CA');
    expect(url).toContain('tax_code=saas');
    expect(url).toContain('transaction_type=sale');
  });

  it('includes optional filters', async () => {
    const { client, calls } = makeClient([{ status: 200, body: { object: 'coverage' } }]);
    await client.coverage.check({
      country: 'DE',
      tax_code: 'saas',
      transaction_type: 'sale',
      customer_type: 'business',
      date: '2026-09-23',
    });
    const url = calls[0]!.url;
    expect(url).toContain('customer_type=business');
    expect(url).toContain('date=2026-09-23');
  });

  it('rejects missing country', async () => {
    const { client } = makeClient();
    await expect(
      client.coverage.check({ country: '', tax_code: 'saas', transaction_type: 'sale' }),
    ).rejects.toMatchObject({ param: 'country' });
  });

  it('rejects missing tax_code', async () => {
    const { client } = makeClient();
    await expect(
      client.coverage.check({ country: 'CA', tax_code: '', transaction_type: 'sale' }),
    ).rejects.toMatchObject({ param: 'tax_code' });
  });

  it('rejects invalid transaction_type', async () => {
    const { client } = makeClient();
    await expect(
      client.coverage.check({
        country: 'CA',
        tax_code: 'saas',
        transaction_type: 'bogus' as never,
      }),
    ).rejects.toMatchObject({ param: 'transaction_type' });
  });

  it('rejects missing transaction_type', async () => {
    const { client } = makeClient();
    await expect(
      client.coverage.check({
        country: 'CA',
        tax_code: 'saas',
        transaction_type: undefined as never,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});