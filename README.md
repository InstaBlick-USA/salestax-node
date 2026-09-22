# salestax-node

[![npm](https://img.shields.io/npm/v/salestax-node)](https://www.npmjs.com/package/salestax-node)
[![CI](https://github.com/InstaBlick-USA/salestax-node/actions/workflows/ci.yml/badge.svg)](https://github.com/InstaBlick-USA/salestax-node/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Official Node.js SDK for the **[Sales Tax Calculator API](https://salestaxcalculatorapi.com)** —
real-time sales tax for 70+ countries, 51 US jurisdictions, and 13 Canadian provinces.
Batch up to 100 transactions. Zero runtime dependencies. Full TypeScript types.

## Install

```bash
npm install salestax-node
```

## Quickstart

```ts
import { SalesTaxClient } from 'salestax-node';

const client = SalesTaxClient.fromEnv(); // reads SALESTAX_API_KEY

const tax = await client.tax.calculate({ zipCode: '90210', amount: 100 });
console.log(tax.taxAmount);   // 9.75
console.log(tax.totalAmount); // 109.75
```

Get your API key → **[salestaxcalculatorapi.com](https://salestaxcalculatorapi.com)**

## Features

- **Zero dependencies** — uses native `fetch`. Works in Node 18+, Bun, Deno, and edge runtimes.
- **Dual ESM / CJS** — tree-shakeable, typed, with source maps.
- **Automatic retries** — exponential backoff with full jitter, honors `Retry-After`.
- **Rich errors** — typed hierarchy (`RateLimitError`, `ValidationError`, …). No string parsing.
- **Hooks** — `onRequest` / `onResponse` / `onRetry` for logging and telemetry.
- **Batch chunking** — `calculateBatchChunked()` splits >100 transactions automatically.

## Batch

```ts
const result = await client.tax.calculateBatchChunked(
  transactions, // any length
  { idempotencyKey: 'order-12345' },
);
```

## Error Handling

```ts
import { RateLimitError, ValidationError } from 'salestax-node';

try {
  await client.tax.calculate({ zipCode: '90210', amount: 100 });
} catch (err) {
  if (err instanceof RateLimitError) { /* back off */ }
  else if (err instanceof ValidationError) { /* err.param */ }
}
```

## Configuration

```ts
const client = new SalesTaxClient({
  apiKey: 'sk_live_...',
  timeoutMs: 20_000,
  chunkBatch: true,
  retry: { maxRetries: 4 },
  hooks: {
    onRetry: ({ attempt, delayMs }) => console.warn(`retry ${attempt} in ${delayMs}ms`),
  },
});
```

## Also Available For

- [salestax-python](https://github.com/InstaBlick-USA/salestax-python) — Python
- [salestax-ruby](https://github.com/InstaBlick-USA/salestax-ruby) — Ruby

## Documentation

Full API reference → **[salestaxcalculatorapi.com/docs](https://salestaxcalculatorapi.com/docs)**

## License

MIT © [InstaBlick USA](https://github.com/InstaBlick-USA)