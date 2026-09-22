import { describe, it, expect } from 'vitest';
import { SalesTaxClient } from '../../src/index.js';

const LIVE = process.env.SALESTAX_INTEGRATION === '1';
const maybe = LIVE ? describe : describe.skip;

maybe('live API', () => {
  it('calculates tax for a US zip', async () => {
    const client = SalesTaxClient.fromEnv();
    const res = await client.tax.calculate({ zipCode: '90210', amount: 100 });
    expect(res.taxAmount).toBeTypeOf('number');
  });

  it('handles a batch', async () => {
    const client = SalesTaxClient.fromEnv();
    const res = await client.tax.calculateBatch([
      { zipCode: '90210', amount: 100 },
      { zipCode: '10001', amount: 250 },
    ]);
    expect(res.count).toBe(2);
  });
});