import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SalesTaxClient, ConnectionError } from '../../src/index.js';

describe('SalesTaxClient', () => {
  const originalEnv = process.env.SALESTAX_API_KEY;

  beforeEach(() => {
    delete process.env.SALESTAX_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) process.env.SALESTAX_API_KEY = originalEnv;
    else delete process.env.SALESTAX_API_KEY;
  });

  it('constructs with an explicit apiKey', () => {
    expect(() => new SalesTaxClient({ apiKey: 'sk_test' })).not.toThrow();
  });

  it('constructs from SALESTAX_API_KEY', () => {
    process.env.SALESTAX_API_KEY = 'sk_env';
    expect(() => SalesTaxClient.fromEnv()).not.toThrow();
  });

  it('throws when no apiKey is available', () => {
    expect(() => new SalesTaxClient()).toThrow(ConnectionError);
    expect(() => new SalesTaxClient()).toThrow(/Missing API key/);
  });

  it('exposes tax, rates, jurisdictions resources', () => {
    const client = new SalesTaxClient({ apiKey: 'k' });
    expect(client.tax).toBeDefined();
    expect(client.rates).toBeDefined();
    expect(client.jurisdictions).toBeDefined();
  });
});