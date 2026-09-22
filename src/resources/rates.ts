// rates.ts
import { ValidationError } from '../errors';
import type { HttpClient } from '../transport/http-client';
import type { RequestOptions } from '../transport/types';
import type { TaxRate } from '../models/rate';

export class RatesResource {
  constructor(private readonly http: HttpClient) {}

  get(zipCode: string, opts?: RequestOptions): Promise<TaxRate> {
    if (!zipCode) throw new ValidationError('MISSING_PARAM', 'zipCode is required', { statusCode: 400, param: 'zipCode' });
    return this.http.send({ method: 'GET', path: `/rates/${encodeURIComponent(zipCode)}`, opts });
  }
}