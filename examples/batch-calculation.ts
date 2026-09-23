import { SalesTaxClient } from 'salestax-node';

const client = SalesTaxClient.fromEnv();

const base = {
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
};

const batch = await client.calculations.createBatch(
  {
    reference: 'batch-2026-09-23',
    calculations: [
      {
        ...base,
        reference: 'order-1',
        lines: [{ reference: 'l1', amount: '100.00', tax_code: 'saas' }],
      },
      {
        ...base,
        reference: 'order-2',
        lines: [{ reference: 'l2', amount: '250.00', tax_code: 'saas' }],
      },
    ],
  },
  { idempotencyKey: 'batch-2026-09-23-xyz' },
);

console.log(`Batch ${batch.id}: ${batch.status} (${batch.total_count} items)`);