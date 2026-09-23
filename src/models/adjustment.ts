import type { AuditExpansion, Currency, TaxComponent } from './common'

export type AdjustmentReason = 'refund' | 'credit' | 'correction'

export interface AdjustmentAmountLineCreate {
  line_id: string
  amount: string
}

export interface AdjustmentQuantityLineCreate {
  line_id: string
  quantity: string
}

export type AdjustmentLineCreate =
  | AdjustmentAmountLineCreate
  | AdjustmentQuantityLineCreate

export interface AdjustmentCreate {
  reference: string
  reason: AdjustmentReason
  lines: AdjustmentLineCreate[]
}

export interface AdjustmentLine {
  line_id: string
  subtotal: string
  tax: string
  total: string
  components?: TaxComponent[]
}

export interface Adjustment {
  id: string
  object: 'adjustment'
  transaction_id: string
  reference: string
  reason: AdjustmentReason
  currency: Currency
  subtotal: string
  tax: string
  total: string
  lines: AdjustmentLine[]
  request_id: string
  created_at: string
  expanded?: Array<'audit'>
  audit?: AuditExpansion
}

export interface AdjustmentPage {
  object: 'list'
  items: Adjustment[]
  has_more: boolean
  next_cursor?: string | null
}

export interface ListAdjustmentsParams {
  limit?: number
  starting_after?: string
  expand?: 'audit'
}