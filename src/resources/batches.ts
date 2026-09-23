import { ValidationError } from '../errors'
import type { CalculationBatch } from '../models/index'
import type { HttpClient } from '../transport/http-client'
import type { RequestOptions } from '../transport/types'

export class BatchesResource {
  constructor(private readonly http: HttpClient) {}

  async get(id: string, options: RequestOptions = {}): Promise<CalculationBatch> {
    if (!id) {
      throw new ValidationError('invalid_request', 'batch id is required', {
        statusCode: 400, param: 'batch_id',
      })
    }
    return this.http.send<CalculationBatch>({
      method: 'GET',
      path: `/v1/calculation-batches/${encodeURIComponent(id)}`,
      options,
    })
  }
}