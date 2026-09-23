import { MAX_BATCH_SIZE, MAX_LINES_PER_CALCULATION } from '../config'
import { ValidationError } from '../errors'
import type {
  Calculation, CalculationBatch, CalculationBatchCreate, CalculationCreate,
} from '../models/index'
import type { HttpClient } from '../transport/http-client'
import type { RequestOptions } from '../transport/types'

export class CalculationsResource {
  constructor(private readonly http: HttpClient) {}

  async create(params: CalculationCreate, options: RequestOptions = {}): Promise<Calculation> {
    validateCalculation(params)
    return this.http.send<Calculation>({
      method: 'POST', path: '/v1/calculations', body: params, options,
    })
  }

  async get(id: string, options: RequestOptions = {}): Promise<Calculation> {
    if (!id) {
      throw new ValidationError('invalid_request', 'calculation id is required', {
        statusCode: 400, param: 'calculation_id',
      })
    }
    return this.http.send<Calculation>({
      method: 'GET',
      path: `/v1/calculations/${encodeURIComponent(id)}`,
      options,
    })
  }

  async createBatch(params: CalculationBatchCreate, options: RequestOptions = {}): Promise<CalculationBatch> {
    if (!Array.isArray(params.calculations) || params.calculations.length === 0) {
      throw new ValidationError('invalid_request', 'calculations must contain at least one entry', {
        statusCode: 400, param: 'calculations',
      })
    }
    if (params.calculations.length > MAX_BATCH_SIZE) {
      throw new ValidationError('request_too_large', `Batch is limited to ${MAX_BATCH_SIZE} calculations`, {
        statusCode: 400, param: 'calculations',
      })
    }
    params.calculations.forEach(validateCalculation)
    return this.http.send<CalculationBatch>({
      method: 'POST', path: '/v1/calculation-batches', body: params, options,
    })
  }

  async getBatch(id: string, options: RequestOptions = {}): Promise<CalculationBatch> {
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

function validateCalculation(p: CalculationCreate): void {
  const fail = (param: string, message: string): never => {
    throw new ValidationError('invalid_request', message, { statusCode: 400, param })
  }
  if (!p.currency) fail('currency', 'currency is required')
  if (!p.tax_behavior) fail('tax_behavior', 'tax_behavior is required')
  if (!p.billing_event) fail('billing_event', 'billing_event is required')
  if (!p.seller) fail('seller', 'seller is required')
  if (!p.seller?.country) fail('seller/country', 'seller.country is required')
  if (!p.seller?.channel_role) fail('seller/channel_role', 'seller.channel_role is required')
  if (!Array.isArray(p.seller?.registrations)) fail('seller/registrations', 'seller.registrations is required')
  if (!p.customer) fail('customer', 'customer is required')
  if (!p.customer?.address) fail('customer/address', 'customer.address is required')
  if (!p.customer.address?.country) fail('customer/address/country', 'customer.address.country is required')

  if (!Array.isArray(p.lines) || p.lines.length === 0) fail('lines', 'lines must contain at least one line')
  if (p.lines.length > MAX_LINES_PER_CALCULATION) {
    throw new ValidationError('request_too_large', `A calculation supports at most ${MAX_LINES_PER_CALCULATION} lines`, {
      statusCode: 400, param: 'lines',
    })
  }
  p.lines.forEach((line, i) => {
    if (!line.reference) fail(`lines/${i}/reference`, 'line.reference is required')
    if (!line.amount) fail(`lines/${i}/amount`, 'line.amount is required')
    if (!line.tax_code) fail(`lines/${i}/tax_code`, 'line.tax_code is required')
    if (!/^(0|[1-9][0-9]*)(\.[0-9]{1,3})?$/.test(line.amount)) {
      fail(`lines/${i}/amount`, 'line.amount must be a decimal string with up to 3 decimal places')
    }
  })
}