import {
  RateLimitError,
  SalesTaxClient,
  TimeoutError,
  ValidationError,
} from 'salestax-node';

const client = SalesTaxClient.fromEnv();

try {
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
    { idempotencyKey: 'order-demo-err-001' },
  );
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Rate limited. Retry in ${err.retryAfterMs}ms. req=${err.requestId}`);
  } else if (err instanceof ValidationError) {
    console.log(`Invalid field: ${err.param}. ${err.message}`);
  } else if (err instanceof TimeoutError) {
    console.log('Timed out - safe to retry.');
  } else {
    throw err;
  }
}