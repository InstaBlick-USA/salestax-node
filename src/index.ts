/**
 * Official Node.js SDK for the Sales Tax Calculator API.
 *
 * Real-time sales tax for 70+ countries, 51 US jurisdictions, and 13 Canadian
 * provinces. Batch up to 100 transactions per call.
 *
 * Docs: https://salestaxcalculatorapi.com/docs
 */

export { SalesTaxClient } from './client.js';
export {
  DEFAULT_BASE_URL,
  DEFAULT_RETRY,
  DEFAULT_TIMEOUT_MS,
  ENV_API_KEY,
  MAX_BATCH_SIZE,
  type ClientOptions,
  type RetryPolicy,
} from './config.js';

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
} from './errors/index.js';

export type {
  CalculateTaxParams,
  TaxBreakdownEntry,
  TaxCalculation,
  BatchResult,
  TaxRate,
  Jurisdiction,
  JurisdictionQuery,
} from './models/index.js';

export type {
  Hooks,
  RequestOptions,
  RequestInfo,
  ResponseInfo,
  RetryInfo,
} from './transport/types.js';

export { VERSION } from './version.js';