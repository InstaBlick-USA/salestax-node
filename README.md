# salestax-node

[![npm](https://img.shields.io/npm/v/salestax-node)](https://www.npmjs.com/package/salestax-node)
[![CI](https://github.com/InstaBlick-USA/salestax-node/actions/workflows/ci.yml/badge.svg)](https://github.com/InstaBlick-USA/salestax-node/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Official Node.js SDK for the [Sales Tax Calculator API](https://salestaxcalculatorapi.com). It covers immutable sales tax calculations, transactions, adjustments, batches, and coverage checks.

The package supports Node.js 18 or newer, has no runtime dependencies, and includes TypeScript declarations for every public resource and model.

## Install

```bash
npm install salestax-node
```

## Quickstart

Set `SALESTAX_API_KEY` in your server environment, then create a client:

```ts
import { SalesTaxClient } from 'salestax-node'

const client = SalesTaxClient.fromEnv()

const calculation = await client.calculations.create(
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
        {
          country: 'CA',
          state: 'ON',
          type: 'gst_hst',
          effective_from: '2026-01-01',
        },
      ],
    },
    customer: {
      type: 'consumer',
      address: {
        country: 'CA',
        state: 'ON',
        postal_code: 'M5V 2T6',
      },
    },
    lines: [
      {
        reference: 'subscription',
        amount: '100.00',
        quantity: '1',
        tax_code: 'saas',
      },
    ],
  },
  { idempotencyKey: 'order-1001-abc12345' },
)

if (calculation.outcome === 'review_required' || calculation.outcome === 'unsupported') {
  throw new Error(`Tax result needs review: ${calculation.explanation}`)
}

console.log(calculation.tax, calculation.total, calculation.request_id)
```

[Create an API key](https://salestaxcalculatorapi.com/login?mode=signup&redirect=%2Fdashboard%2Fapi-keys). Keep it in trusted server code and never expose it in a browser or mobile application.

## Resources

| Resource | Methods |
| --- | --- |
| `client.calculations` | `create`, `get`, `createBatch`, `getBatch` |
| `client.transactions` | `create`, `get` |
| `client.transactions.adjustments` | `create`, `list`, `get` |
| `client.batches` | `get` |
| `client.coverage` | `check` |

## Transactions

Finalize a calculation as an immutable commercial record:

```ts
const transaction = await client.transactions.create(
  {
    calculation_id: calculation.id,
    reference: 'order-1001',
  },
  { idempotencyKey: 'order-1001-transaction' },
)
```

## Adjustments

Reverse part of a transaction by exact amount or proportional quantity:

```ts
const adjustment = await client.transactions.adjustments.create(
  transaction.id,
  {
    reference: 'refund-order-1001',
    reason: 'refund',
    lines: [{ line_id: calculation.lines[0].id, amount: '25.00' }],
  },
  { idempotencyKey: 'refund-order-1001-001' },
)

console.log(adjustment.tax)
```

## Batches

Submit up to 100 calculations, then poll the batch resource:

```ts
const batch = await client.calculations.createBatch(
  {
    reference: 'batch-2026-09-23',
    calculations: [calculationRequestA, calculationRequestB],
  },
  { idempotencyKey: 'batch-2026-09-23-xyz' },
)

const status = await client.batches.get(batch.id)
console.log(status.status, status.succeeded_count, status.failed_count)
```

## Coverage

Check whether a specific transaction is qualified before calculating it:

```ts
const coverage = await client.coverage.check({
  country: 'CA',
  state: 'ON',
  tax_code: 'saas',
  transaction_type: 'sale',
})

console.log(coverage.qualification)
```

## Audit details

Pass `expand: 'audit'` in the request options for an authorized audit expansion:

```ts
const calculation = await client.calculations.get('calc_01J6...', {
  expand: 'audit',
})

console.log(calculation.audit?.components)
```

## Errors

HTTP, validation, network, and timeout failures map to typed errors:

```ts
import {
  RateLimitError,
  SalesTaxError,
  TimeoutError,
  ValidationError,
} from 'salestax-node'

try {
  await client.calculations.create(payload, {
    idempotencyKey: 'order-1001-abc12345',
  })
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(error.retryAfterMs, error.requestId)
  } else if (error instanceof ValidationError) {
    console.error(error.param, error.message)
  } else if (error instanceof TimeoutError) {
    console.error('The request timed out and can be retried with the same idempotency key.')
  } else if (error instanceof SalesTaxError) {
    console.error(error.code, error.requestId, error.retryable)
  } else {
    throw error
  }
}
```

## Idempotency

Every mutating request accepts an `idempotencyKey` option. Reuse the same key when retrying the same operation. Keys must contain 8 to 255 safe ASCII characters and match `[A-Za-z0-9][A-Za-z0-9._:-]{7,254}`.

Reusing a key with a different request body returns `409 idempotency_conflict`.

## Configuration

```ts
const client = new SalesTaxClient({
  apiKey: process.env.SALESTAX_API_KEY,
  baseUrl: 'https://api.salestaxcalculatorapi.com',
  timeoutMs: 20_000,
  retry: {
    maxRetries: 4,
    initialDelayMs: 250,
    maxDelayMs: 8_000,
    backoffFactor: 2,
    jitter: true,
  },
  hooks: {
    onRetry: ({ attempt, delayMs, error }) =>
      console.warn(`retry ${attempt} in ${delayMs}ms after ${error.code}`),
  },
})
```

### Defaults

| Option | Default |
| --- | --- |
| `baseUrl` | `https://api.salestaxcalculatorapi.com` |
| `timeoutMs` | `30000` |
| `retry.maxRetries` | `2` |
| `retry.initialDelayMs` | `250` |
| `retry.maxDelayMs` | `8000` |
| `retry.backoffFactor` | `2` |
| `retry.jitter` | `true` |

## Behavior

- The SDK retries network failures, timeouts, `429` responses, and retryable `5xx` responses with exponential backoff and jitter. It honors `Retry-After` when present.
- Money and quantity values are decimal strings. A line's `amount` is its total amount, not a unit price.
- Request and response fields use the same snake_case names as the OpenAPI contract.
- Hooks run for requests, responses, and retries. An exception thrown by a hook does not interrupt the API request.
- Unknown JSON fields remain subject to authoritative server validation.

## Python SDK

Python integrations can use [salestax-python](https://github.com/InstaBlick-USA/salestax-python).

## Documentation

Read the [API documentation](https://salestaxcalculatorapi.com/docs) or inspect the runnable examples in [`examples`](./examples).

## License

MIT (c) [InstaBlick USA](https://github.com/InstaBlick-USA)
