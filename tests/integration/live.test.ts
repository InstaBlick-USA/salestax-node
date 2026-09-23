import { describe, it, expect } from 'vitest';
import { SalesTaxClient } from '../../src/index';

const LIVE = process.env.SALESTAX_INTEGRATION === '1';
const maybe = LIVE ? describe : describe.skip;

maybe('live API', () => {
  it('creates a calculation', async () => {
    const client = SalesTaxClient.fromEnv();
    const calc = await client.calculations.create(
      {
        reference: 'sdk-live-calc',
        transaction_date: '2026-09-23',
        currency: 'CAD',
        tax_behavior: 'exclusive',
        billing_event: 'subscription_start',
        seller: {
          country: 'CA',
          channel_role: 'direct_legal_supplier',
          registrations: [
            { country: 'CA', state: 'ON', type: 'gst_hst', effective_from: '2026-01-01' },
          ],
        },
        customer: {
          type: 'consumer',
          address: { country: 'CA', state: 'ON', postal_code: 'M5V 2T6' },
        },
        lines: [
          { reference: 'subscription', amount: '100.00', quantity: '1', tax_code: 'saas' },
        ],
      },
      { idempotencyKey: `sdk-live-calc-${Date.now()}` },
    );
    expect(calc.id).toMatch(/^calc_/);
    expect(calc.outcome).toBeTruthy();
  });

  it('checks coverage', async () => {
    const client = SalesTaxClient.fromEnv();
    const coverage = await client.coverage.check({
      country: 'CA',
      state: 'ON',
      tax_code: 'saas',
      transaction_type: 'sale',
    });
    expect(coverage.object).toBe('coverage');
  });
});