import { ValidationError } from '../errors'
import type { Coverage, CoverageQuery } from '../models/index'
import type { HttpClient } from '../transport/http-client'
import type { RequestOptions } from '../transport/types'

const TRANSACTION_TYPES = ['sale', 'refund', 'credit']

export class CoverageResource {
  constructor(private readonly http: HttpClient) {}

  async check(query: CoverageQuery, options: RequestOptions = {}): Promise<Coverage> {
    if (!query.country) {
      throw new ValidationError('invalid_request', 'country is required', {
        statusCode: 400, param: 'country',
      })
    }
    if (!query.tax_code) {
      throw new ValidationError('invalid_request', 'tax_code is required', {
        statusCode: 400, param: 'tax_code',
      })
    }
    if (!query.transaction_type || !TRANSACTION_TYPES.includes(query.transaction_type)) {
      throw new ValidationError('invalid_request', 'transaction_type must be sale, refund, or credit', {
        statusCode: 400, param: 'transaction_type',
      })
    }
    const qs = new URLSearchParams()
    qs.set('country', query.country)
    qs.set('tax_code', query.tax_code)
    qs.set('transaction_type', query.transaction_type)
    if (query.state != null) qs.set('state', query.state)
    if (query.customer_type != null) qs.set('customer_type', query.customer_type)
    if (query.date != null) qs.set('date', query.date)
    return this.http.send<Coverage>({
      method: 'GET', path: `/v1/coverage?${qs.toString()}`, options,
    })
  }
}