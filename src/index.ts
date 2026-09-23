/**
 * Official Node.js SDK for the Sales Tax Calculator API.
 *
 * Immutable sales tax calculations, transactions, adjustments, batches,
 * and coverage checks.
 *
 * Docs: https://salestaxcalculatorapi.com/docs
 */

export { SalesTaxClient } from './client'
export {
  DEFAULT_BASE_URL,
  DEFAULT_RETRY,
  DEFAULT_TIMEOUT_MS,
  ENV_API_KEY,
  MAX_BATCH_SIZE,
  MAX_LINES_PER_CALCULATION,
  MAX_LINES_PER_ADJUSTMENT,
  MAX_REGISTRATIONS,
  type ClientOptions,
  type RetryPolicy,
} from './config'

export {
  SalesTaxError,
  ApiError,
  AuthenticationError,
  PermissionError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  ConnectionError,
  TimeoutError,
  errorFromResponse,
  type SalesTaxErrorOptions,
  type ApiErrorOptions,
  type ErrorResponseBody,
} from './errors'

export type {
  Currency, TaxBehavior, BillingEvent, SellerChannelRole, CustomerType,
  TransactionType, Outcome, TaxIdType, LocationEvidenceKind, JurisdictionLevel,
  Address, TaxIdInput, LocationEvidence, SellerRegistration, Seller, Customer,
  CalculationLineCreate, CalculationLine, Jurisdiction, TaxComponent,
  EvidenceResult, AuditExpansion,
  CalculationCreate, Calculation, CalculationBatchCreate,
  CalculationBatchStatus, CalculationBatchItemStatus,
  CalculationBatchItem, CalculationBatch,
  TransactionCreate, Transaction,
  AdjustmentReason, AdjustmentAmountLineCreate, AdjustmentQuantityLineCreate,
  AdjustmentLineCreate, AdjustmentCreate, AdjustmentLine, Adjustment,
  AdjustmentPage, ListAdjustmentsParams,
  CoverageQuery, Qualification, CoverageCalculation, Obligation,
  TaxIdValidation, SourceBasis, EvidenceRequired, Coverage,
  ProblemCode, FieldProblem, Problem,
} from './models'

export type {
  Hooks,
  RequestOptions,
  RequestInfo,
  ResponseInfo,
  RetryInfo,
} from './transport/types'

export { VERSION } from './version'