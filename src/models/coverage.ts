import type { CustomerType, SubdivisionCode, TransactionType } from './common'

export interface CoverageQuery {
  country: string
  tax_code: string
  transaction_type: TransactionType
  state?: SubdivisionCode
  customer_type?: CustomerType
  date?: string
}

export type Qualification = 'qualified' | 'review_required' | 'unsupported'
export type CoverageCalculation = 'supported' | 'review_required' | 'unsupported'
export type Obligation = 'derived' | 'review_required' | 'unsupported'
export type TaxIdValidation = 'authoritative' | 'format_only' | 'not_available'
export type SourceBasis = 'official' | 'licensed' | 'none'
export type EvidenceRequired =
  | 'customer_address'
  | 'ship_from'
  | 'ship_to'
  | 'tax_id'
  | 'exemption_certificate'

export interface Coverage {
  object: 'coverage'
  qualification: Qualification
  country: string
  tax_code: string
  transaction_type: TransactionType
  calculation: CoverageCalculation
  obligation: Obligation
  tax_id_validation: TaxIdValidation
  source_basis: SourceBasis
  as_of: string
  request_id: string
  state?: SubdivisionCode
  customer_type?: CustomerType
  evidence_required?: EvidenceRequired[]
  effective_from?: string
  effective_through?: string | null
  next_review_due_at?: string | null
  message?: string
}