import { describe, it, expect } from 'vitest';
import { SalesTaxClient, ValidationError } from '../../src/index';
import { makeMockFetch } from './helpers';

describe('BatchesResource', () => {
  it('gets a batch by id', async () => {
    const { fn, calls } = makeMockFetch([
      { status: 200, body: { id: 'batch_1', object: 'calculation_batch', status: 'completed' } },
    ]);
    const client = new SalesTaxClient({ apiKey: 'stca_test', fetch: fn });
    const result = await client.batches.get('batch_1');
    expect(result.id).toBe('batch_1');
    expect(calls[0]!.url).toMatch(/\/v1\/calculation-batches\/batch_1$/);
  });

  it('rejects missing id', async () => {
    const { fn } = makeMockFetch([]);
    const client = new SalesTaxClient({ apiKey: 'stca_test', fetch: fn });
    await expect(client.batches.get('')).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects empty id with correct param name', async () => {
    const { fn } = makeMockFetch([]);
    const client = new SalesTaxClient({ apiKey: 'stca_test', fetch: fn });
    await expect(client.batches.get('')).rejects.toMatchObject({ param: 'batch_id' });
  });
});