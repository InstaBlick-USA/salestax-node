import { ValidationError } from '../errors/index.js';
import type { TaxRate } from '../models/rate.js';
import type { HttpClient } from '../transport/http-client.js';
import type { RequestOptions } from '../transport/types.js';

export class RatesResource {
  constructor(private readonly http: HttpClient) {}

  async get(zipCode: string, options: RequestOptions = {}): Promise<TaxRate> {
    if (!zipCode) {
      throw new ValidationError('MISSING_PARAM', 'zipCode is required', {
        statusCode: 400,
        param: 'zipCode',
      });
    }
    return this.http.send<TaxRate>({
      method: 'GET',
      path: `/rates/${encodeURIComponent(zipCode)}`,
      options,
    });
  }
}