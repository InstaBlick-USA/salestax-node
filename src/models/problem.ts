export type ProblemCode =
  | 'invalid_request'
  | 'unknown_field'
  | 'request_too_large'
  | 'unsupported_currency'
  | 'invalid_api_key'
  | 'invalid_cursor'
  | 'invalid_idempotency_key'
  | 'rate_limit_exceeded'
  | 'forbidden'
  | 'internal_error'
  | 'runtime_not_configured'
  | 'resource_not_found'
  | 'subscription_required'
  | 'usage_cap_reached'
  | 'idempotency_conflict'
  | 'idempotency_unavailable'
  | 'request_in_progress'
  | 'tax_data_ambiguous'
  | 'adjustment_amount_invalid'
  | 'adjustment_amount_too_small'
  | 'adjustment_conflict'
  | 'adjustment_exceeds_original'
  | 'adjustment_line_invalid'
  | 'calculation_already_finalized'
  | 'calculation_not_finalizable'

export interface FieldProblem {
  pointer: string
  message: string
}

export interface Problem {
  type: string
  title: string
  status: number
  detail: string
  instance: string
  code: ProblemCode
  request_id: string
  retryable: boolean
  retry_after_seconds?: number
  errors?: FieldProblem[]
}