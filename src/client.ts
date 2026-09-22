import type { ClientOptions } from './config';
import { HttpClient } from './transport/http-client';
import { TaxResource } from './resources/tax';
import { RatesResource } from './resources/rates';
import { JurisdictionsResource } from './resources/jurisdictions';

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

  /** Construct using SALESTAX_API_KEY from the environment. */
  static fromEnv(overrides: Omit<ClientOptions, 'apiKey'> = {}): SalesTaxClient {
    return new SalesTaxClient(overrides);
  }
}