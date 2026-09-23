import { describe, it, expect } from 'vitest';
import { SalesTaxClient } from '../../src/index';
import { makeMockFetch } from './helpers';

const validParams = {
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
  lines: [{ reference: 'subscription', amount: '100.00', tax_code: 'saas' }],
};

describe('Hooks', () => {
  it('fires onRequest and onResponse on success', async () => {
    const events: string[] = [];
    const { fn } = makeMockFetch([{ status: 201, body: { id: 'calc_1' } }]);
    const client = new SalesTaxClient({
      apiKey: 'stca_test',
      fetch: fn,
      hooks: {
        onRequest: () => events.push('request'),
        onResponse: () => events.push('response'),
        onRetry: () => events.push('retry'),
      },
    });
    await client.calculations.create(validParams);
    expect(events).toEqual(['request', 'response']);
  });

  it('fires onRetry when retrying', async () => {
    const events: string[] = [];
    const { fn } = makeMockFetch([
      { status: 500, body: {} },
      { status: 201, body: { id: 'calc_1' } },
    ]);
    const client = new SalesTaxClient({
      apiKey: 'stca_test',
      fetch: fn,
      retry: { initialDelayMs: 0 },
      hooks: { onRetry: () => events.push('retry') },
    });
    await client.calculations.create(validParams);
    expect(events).toContain('retry');
  });

  it('swallows hook exceptions', async () => {
    const { fn } = makeMockFetch([{ status: 201, body: {} }]);
    const client = new SalesTaxClient({
      apiKey: 'stca_test',
      fetch: fn,
      hooks: {
        onRequest: () => { throw new Error('bug'); },
        onResponse: () => { throw new Error('bug'); },
      },
    });
    await expect(client.calculations.create(validParams)).resolves.toBeDefined();
  });

  it('swallows onRetry hook exceptions', async () => {
    const { fn } = makeMockFetch([
      { status: 500, body: {} },
      { status: 201, body: { id: 'calc_1' } },
    ]);
    const client = new SalesTaxClient({
      apiKey: 'stca_test',
      fetch: fn,
      retry: { initialDelayMs: 0 },
      hooks: { onRetry: () => { throw new Error('hook bug'); } },
    });
    await expect(client.calculations.create(validParams)).resolves.toBeDefined();
  });
});