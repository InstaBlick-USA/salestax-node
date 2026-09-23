import { ValidationError } from '../errors'
import type { Transaction, TransactionCreate } from '../models/index'
import type { HttpClient } from '../transport/http-client'
import type { RequestOptions } from '../transport/types'
import { AdjustmentsResource } from './adjustments'

export class TransactionsResource {
  readonly adjustments: AdjustmentsResource

  constructor(private readonly http: HttpClient) {
    this.adjustments = new AdjustmentsResource(http)
  }

  async create(params: TransactionCreate, options: RequestOptions = {}): Promise<Transaction> {
    if (!params.calculation_id) {
      throw new ValidationError('invalid_request', 'calculation_id is required', {
        statusCode: 400, param: 'calculation_id',
      })
    }
    if (!params.reference) {
      throw new ValidationError('invalid_request', 'reference is required', {
        statusCode: 400, param: 'reference',
      })
    }
    return this.http.send<Transaction>({
      method: 'POST', path: '/v1/transactions', body: params, options,
    })
  }

  async get(id: string, options: RequestOptions = {}): Promise<Transaction> {
    if (!id) {
      throw new ValidationError('invalid_request', 'transaction id is required', {
        statusCode: 400, param: 'transaction_id',
      })
    }
    return this.http.send<Transaction>({
      method: 'GET',
      path: `/v1/transactions/${encodeURIComponent(id)}`,
      options,
    })
  }
}