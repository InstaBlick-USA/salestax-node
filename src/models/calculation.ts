import type {
  Address, AuditExpansion, BillingEvent, CalculationLine,
  CalculationLineCreate, Currency, Customer, Outcome, Seller, TaxBehavior,
} from './common'
import type { Problem } from './problem'

export interface CalculationCreate {
  currency: Currency
  tax_behavior: TaxBehavior
  billing_event: BillingEvent
  seller: Seller
  customer: Customer
  lines: CalculationLineCreate[]
  reference?: string
  transaction_date?: string
  ship_from?: Address
  ship_to?: Address
}

export interface Calculation {
  id: string
  object: 'calculation'
  outcome: Outcome
  currency: Currency
  subtotal: string
  taxable_amount: string
  tax: string
  total: string
  lines: CalculationLine[]
  explanation: string
  request_id: string
  created_at: string
  reference?: string
  expanded?: Array<'audit'>
  audit?: AuditExpansion
}

export interface CalculationBatchCreate {
  calculations: CalculationCreate[]
  reference?: string
}

export type CalculationBatchStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'partially_failed'
  | 'failed'

export type CalculationBatchItemStatus =
  | 'queued'
  | 'processing'
  | 'succeeded'
  | 'failed'

export interface CalculationBatchItem {
  index: number
  status: CalculationBatchItemStatus
  calculation?: Calculation
  problem?: Problem
}

export interface CalculationBatch {
  id: string
  object: 'calculation_batch'
  status: CalculationBatchStatus
  total_count: number
  succeeded_count: number
  failed_count: number
  items: CalculationBatchItem[]
  request_id: string
  created_at: string
  reference?: string
  completed_at?: string | null
}