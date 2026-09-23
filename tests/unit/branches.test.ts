import { describe, it, expect } from 'vitest';
import { SalesTaxClient, ValidationError } from '../../src/index';
import { makeMockFetch } from './helpers';

function client(responses: Parameters<typeof makeMockFetch>[0] = []) {
  const { fn, calls } = makeMockFetch(responses);
  return { c: new SalesTaxClient({ apiKey: 'stca_test', fetch: fn }), calls };
}

describe('Branch coverage', () => {
  it('calculations.get rejects missing id', async () => {
    const { c } = client();
    await expect(c.calculations.get('')).rejects.toBeInstanceOf(ValidationError);
  });

  it('calculations.getBatch rejects missing id', async () => {
    const { c } = client();
    await expect(c.calculations.getBatch('')).rejects.toBeInstanceOf(ValidationError);
  });

  it('transactions.get rejects missing id', async () => {
    const { c } = client();
    await expect(c.transactions.get('')).rejects.toBeInstanceOf(ValidationError);
  });

  it('adjustments.create rejects missing transaction_id', async () => {
    const { c } = client();
    await expect(
      c.transactions.adjustments.create('', {
        reference: 'r',
        reason: 'refund',
        lines: [{ line_id: 'l', amount: '1.00' }],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('adjustments.create rejects line missing line_id', async () => {
    const { c } = client();
    await expect(
      c.transactions.adjustments.create('txn_1', {
        reference: 'r',
        reason: 'refund',
        lines: [{ amount: '1.00' } as never],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('adjustments.list rejects missing transaction_id', async () => {
    const { c } = client();
    await expect(c.transactions.adjustments.list('')).rejects.toBeInstanceOf(ValidationError);
  });

  it('adjustments.list forwards expand=audit', async () => {
    const { c, calls } = client([
      { status: 200, body: { object: 'list', items: [], has_more: false } },
    ]);
    await c.transactions.adjustments.list('txn_1', { expand: 'audit' });
    expect(calls[0]!.url).toContain('expand=audit');
  });

  it('adjustments.get rejects missing ids', async () => {
    const { c } = client();
    await expect(c.transactions.adjustments.get('', '')).rejects.toBeInstanceOf(ValidationError);
    await expect(
      c.transactions.adjustments.get('txn_1', ''),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});