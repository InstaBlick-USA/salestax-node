import type { AuditExpansion, Currency } from './common'

export interface TransactionCreate {
  calculation_id: string
  reference: string
  occurred_at?: string
}

export interface Transaction {
  id: string
  object: 'transaction'
  reference: string
  calculation_id: string
  currency: Currency
  subtotal: string
  taxable_amount: string
  tax: string
  total: string
  adjusted_amount: string
  adjusted_tax: string
  request_id: string
  created_at: string
  expanded?: Array<'audit'>
  audit?: AuditExpansion
}