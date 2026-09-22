import { SalesTaxClient } from 'salestax-node';

const client = new SalesTaxClient({
  apiKey: process.env.SALESTAX_API_KEY!,
  hooks: {
    onRequest: ({ method, url, attempt }) =>
      console.log(`→ ${method} ${url} (attempt ${attempt})`),
    onResponse: ({ status, durationMs, requestId }) =>
      console.log(`← ${status} in ${durationMs}ms (req=${requestId})`),
    onRetry: ({ attempt, delayMs, error }) =>
      console.warn(`↻ retry ${attempt} in ${delayMs}ms after ${error.code}`),
  },
});

await client.tax.calculate({ zipCode: '90210', amount: 100 });