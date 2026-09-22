import type { ClientOptions } from './config.js';
import { HttpClient } from './transport/http-client.js';
import { JurisdictionsResource } from './resources/jurisdictions.js';
import { RatesResource } from './resources/rates.js';
import { TaxResource } from './resources/tax.js';

/**
 * Client for the Sales Tax Calculator API.
 *
 * @example
 * ```ts
 * import { SalesTaxClient } from 'salestax-node';
 *
 * const client = SalesTaxClient.fromEnv();
 * const tax = await client.tax.calculate({ zipCode: '90210', amount: 100 });
 * console.log(tax.taxAmount);
 * ```
 */
export class SalesTaxClient {
  readonly tax: TaxResource;
  readonly rates: RatesResource;
  readonly jurisdictions: JurisdictionsResource;

  constructor(options: ClientOptions = {}) {
    const http = new HttpClient(options);
    this.tax = new TaxResource(http, options.chunkBatch ?? false);
    this.rates = new RatesResource(http);
    this.jurisdictions = new JurisdictionsResource(http);
  }

  /** Construct using the `SALESTAX_API_KEY` environment variable. */
  static fromEnv(overrides: Omit<ClientOptions, 'apiKey'> = {}): SalesTaxClient {
    return new SalesTaxClient(overrides);
  }
}