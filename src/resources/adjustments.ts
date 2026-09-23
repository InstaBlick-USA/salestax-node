import { MAX_LINES_PER_ADJUSTMENT } from '../config'
import { ValidationError } from '../errors'
import type {
  Adjustment, AdjustmentCreate, AdjustmentPage, ListAdjustmentsParams,
} from '../models/index'
import type { HttpClient } from '../transport/http-client'
import type { RequestOptions } from '../transport/types'

export class AdjustmentsResource {
  constructor(private readonly http: HttpClient) {}

  async create(
    transactionId: string,
    params: AdjustmentCreate,
    options: RequestOptions = {},
  ): Promise<Adjustment> {
    if (!transactionId) {
      throw new ValidationError('invalid_request', 'transaction_id is required', {
        statusCode: 400, param: 'transaction_id',
      })
    }
    if (!params.reference) {
      throw new ValidationError('invalid_request', 'reference is required', {
        statusCode: 400, param: 'reference',
      })
    }
    if (!['refund', 'credit', 'correction'].includes(params.reason)) {
      throw new ValidationError('invalid_request', 'reason must be refund, credit, or correction', {
        statusCode: 400, param: 'reason',
      })
    }
    if (!Array.isArray(params.lines) || params.lines.length === 0) {
      throw new ValidationError('invalid_request', 'lines must contain at least one entry', {
        statusCode: 400, param: 'lines',
      })
    }
    if (params.lines.length > MAX_LINES_PER_ADJUSTMENT) {
      throw new ValidationError('request_too_large', `An adjustment supports at most ${MAX_LINES_PER_ADJUSTMENT} lines`, {
        statusCode: 400, param: 'lines',
      })
    }
    params.lines.forEach((line, i) => {
      if (!line.line_id) {
        throw new ValidationError('invalid_request', 'line.line_id is required', {
          statusCode: 400, param: `lines/${i}/line_id`,
        })
      }
      const hasAmount = 'amount' in line
      const hasQuantity = 'quantity' in line
      if (!hasAmount && !hasQuantity) {
        throw new ValidationError('invalid_request', 'each line must set either amount or quantity', {
          statusCode: 400, param: `lines/${i}`,
        })
      }
    })
    return this.http.send<Adjustment>({
      method: 'POST',
      path: `/v1/transactions/${encodeURIComponent(transactionId)}/adjustments`,
      body: params,
      options,
    })
  }

  async list(
    transactionId: string,
    params: ListAdjustmentsParams = {},
    options: RequestOptions = {},
  ): Promise<AdjustmentPage> {
    if (!transactionId) {
      throw new ValidationError('invalid_request', 'transaction_id is required', {
        statusCode: 400, param: 'transaction_id',
      })
    }
    const qs = new URLSearchParams()
    if (params.limit != null) qs.set('limit', String(params.limit))
    if (params.starting_after != null) qs.set('starting_after', params.starting_after)
    if (params.expand != null) qs.set('expand', params.expand)
    const query = qs.toString()
    return this.http.send<AdjustmentPage>({
      method: 'GET',
      path: `/v1/transactions/${encodeURIComponent(transactionId)}/adjustments${query ? `?${query}` : ''}`,
      options,
    })
  }

  async get(
    transactionId: string,
    adjustmentId: string,
    options: RequestOptions = {},
  ): Promise<Adjustment> {
    if (!transactionId || !adjustmentId) {
      throw new ValidationError('invalid_request', 'transaction_id and adjustment_id are required', {
        statusCode: 400,
      })
    }
    return this.http.send<Adjustment>({
      method: 'GET',
      path: `/v1/transactions/${encodeURIComponent(transactionId)}/adjustments/${encodeURIComponent(adjustmentId)}`,
      options,
    })
  }
}