import { describe, it, expect } from 'vitest';
import { SalesTaxClient } from '../../src/index.js';
import { makeMockFetch } from './helpers.js';

describe('Hooks', () => {
  it('fires onRequest and onResponse on success', async () => {
    const events: string[] = [];
    const { fn } = makeMockFetch([{ status: 200, body: { taxAmount: 1 } }]);
    const client = new SalesTaxClient({
      apiKey: 'sk_test',
      fetch: fn,
      hooks: {
        onRequest: () => events.push('request'),
        onResponse: () => events.push('response'),
        onRetry: () => events.push('retry'),
      },
    });

    await client.tax.calculate({ zipCode: '90210', amount: 100 });
    expect(events).toEqual(['request', 'response']);
  });

  it('fires onRetry when retrying', async () => {
    const events: string[] = [];
    const { fn } = makeMockFetch([
      { status: 500, body: {} },
      { status: 200, body: { taxAmount: 1 } },
    ]);
    const client = new SalesTaxClient({
      apiKey: 'sk_test',
      fetch: fn,
      retry: { initialDelayMs: 0 },
      hooks: { onRetry: () => events.push('retry') },
    });

    await client.tax.calculate({ zipCode: '90210', amount: 100 });
    expect(events).toContain('retry');
  });

  it('swallows hook exceptions', async () => {
    const { fn } = makeMockFetch([{ status: 200, body: {} }]);
    const client = new SalesTaxClient({
      apiKey: 'sk_test',
      fetch: fn,
      hooks: {
        onRequest: () => { throw new Error('bug'); },
        onResponse: () => { throw new Error('bug'); },
      },
    });

    await expect(client.tax.calculate({ zipCode: '90210', amount: 100 })).resolves.toBeDefined();
  });

  it('swallows onRetry hook exceptions', async () => {
    const { fn } = makeMockFetch([
        { status: 500, body: {} },
        { status: 200, body: { taxAmount: 1 } },
    ]);
    const client = new SalesTaxClient({
        apiKey: 'sk_test',
        fetch: fn,
        retry: { initialDelayMs: 0 },
        hooks: {
        onRetry: () => {
            throw new Error('hook bug');
        },
        },
    });

    await expect(
        client.tax.calculate({ zipCode: '90210', amount: 100 }),
    ).resolves.toBeDefined();
    });
});