import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SalesTaxClient, ConnectionError } from '../../src/index';

describe('SalesTaxClient', () => {
  const originalEnv = process.env.SALESTAX_API_KEY;

  beforeEach(() => { delete process.env.SALESTAX_API_KEY; });
  afterEach(() => {
    if (originalEnv !== undefined) process.env.SALESTAX_API_KEY = originalEnv;
    else delete process.env.SALESTAX_API_KEY;
  });

  it('constructs with an explicit apiKey', () => {
    expect(() => new SalesTaxClient({ apiKey: 'stca_test' })).not.toThrow();
  });

  it('constructs from SALESTAX_API_KEY', () => {
    process.env.SALESTAX_API_KEY = 'stca_env';
    expect(() => SalesTaxClient.fromEnv()).not.toThrow();
  });

  it('throws when no apiKey is available', () => {
    expect(() => new SalesTaxClient()).toThrow(ConnectionError);
    expect(() => new SalesTaxClient()).toThrow(/Missing API key/);
  });

  it('exposes all four resources', () => {
    const client = new SalesTaxClient({ apiKey: 'k' });
    expect(client.calculations).toBeDefined();
    expect(client.transactions).toBeDefined();
    expect(client.transactions.adjustments).toBeDefined();
    expect(client.batches).toBeDefined();
    expect(client.coverage).toBeDefined();
  });
});