import { SalesTaxClient } from 'salestax-node';

const client = SalesTaxClient.fromEnv();

const calc = await client.calculations.create(
  {
    reference: 'order-1001',
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
  { idempotencyKey: 'order-1001-abc12345' },
);

console.log('Outcome:', calc.outcome);
console.log('Subtotal:', calc.subtotal);
console.log('Tax:', calc.tax);
console.log('Total:', calc.total);