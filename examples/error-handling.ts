import { SalesTaxClient, RateLimitError, ValidationError, TimeoutError } from 'salestax-node';

const client = SalesTaxClient.fromEnv();

try {
  await client.tax.calculate({ zipCode: '90210', amount: 100 });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Rate limited. Retry in ${err.retryAfterMs}ms. req=${err.requestId}`);
  } else if (err instanceof ValidationError) {
    console.log(`Bad input on \`${err.param}\`: ${err.message}`);
  } else if (err instanceof TimeoutError) {
    console.log('Timed out — safe to retry.');
  } else {
    throw err;
  }
}