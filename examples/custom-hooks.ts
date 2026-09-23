import { SalesTaxClient } from 'salestax-node';

const client = new SalesTaxClient({
  apiKey: process.env.SALESTAX_API_KEY!,
  hooks: {
    onRequest: ({ method, url, attempt }) =>
      console.log(`-> ${method} ${url} (attempt ${attempt})`),
    onResponse: ({ status, durationMs, requestId }) =>
      console.log(`<- ${status} in ${durationMs}ms (req=${requestId})`),
    onRetry: ({ attempt, delayMs, error }) =>
      console.warn(`retry ${attempt} in ${delayMs}ms after ${error.code}`),
  },
});

await client.calculations.create(
  {
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
    lines: [{ reference: 'subscription', amount: '100.00', tax_code: 'saas' }],
  },
  { idempotencyKey: 'order-hook-demo-001' },
);