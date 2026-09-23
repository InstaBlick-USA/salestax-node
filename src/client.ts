import type { ClientOptions } from './config'
import { HttpClient } from './transport/http-client'
import { BatchesResource } from './resources/batches'
import { CalculationsResource } from './resources/calculations'
import { CoverageResource } from './resources/coverage'
import { TransactionsResource } from './resources/transactions'

/**
 * Client for the Sales Tax Calculator API.
 *
 * @example
 * ```ts
 * import { SalesTaxClient } from 'salestax-node'
 *
 * const client = SalesTaxClient.fromEnv()
 *
 * const calc = await client.calculations.create({
 *   currency: 'CAD',
 *   tax_behavior: 'exclusive',
 *   billing_event: 'subscription_start',
 *   seller: {
 *     country: 'CA',
 *     channel_role: 'direct_legal_supplier',
 *     registrations: [
 *       { country: 'CA', state: 'ON', type: 'gst_hst', effective_from: '2026-01-01' },
 *     ],
 *   },
 *   customer: {
 *     type: 'consumer',
 *     address: { country: 'CA', state: 'ON', postal_code: 'M5V 2T6' },
 *   },
 *   lines: [{ reference: 'subscription', amount: '100.00', quantity: '1', tax_code: 'saas' }],
 * }, { idempotencyKey: 'order-1001-abc12345' })
 *
 * console.log(calc.outcome) // 'calculated'
 * console.log(calc.tax)     // '13.00'
 * ```
 */
export class SalesTaxClient {
  readonly calculations: CalculationsResource
  readonly transactions: TransactionsResource
  readonly batches: BatchesResource
  readonly coverage: CoverageResource

  constructor(options: ClientOptions = {}) {
    const http = new HttpClient(options)
    this.calculations = new CalculationsResource(http)
    this.transactions = new TransactionsResource(http)
    this.batches = new BatchesResource(http)
    this.coverage = new CoverageResource(http)
  }

  static fromEnv(overrides: Omit<ClientOptions, 'apiKey'> = {}): SalesTaxClient {
    return new SalesTaxClient(overrides)
  }
}