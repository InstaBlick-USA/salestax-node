import type { Hooks } from './transport/types';

export interface RetryOptions {
  /** Max retry attempts after the initial try. Default: 2 */
  maxRetries: number;
  /** Base delay in ms. Default: 250 */
  initialDelayMs: number;
  /** Ceiling for any single delay. Default: 8000 */
  maxDelayMs: number;
  /** Exponential multiplier. Default: 2 */
  backoffFactor: number;
  /** Full jitter on delays. Default: true */
  jitter: boolean;
}

export interface ClientOptions {
  /** API key. Falls back to SALESTAX_API_KEY when omitted. */
  apiKey?: string;
  /** Override base URL. Default: https://api.salestaxcalculatorapi.com/v1 */
  baseUrl?: string;
  /** Total per-request timeout in ms. Default: 30000 */
  timeoutMs?: number;
  /** Custom retry policy. Partial overrides merge with defaults. */
  retry?: Partial<RetryOptions>;
  /** Headers merged into every request. */
  defaultHeaders?: Record<string, string>;
  /** Inject a fetch implementation (testing, edge runtimes). */
  fetch?: typeof fetch;
  /** Lifecycle hooks for logging / telemetry. */
  hooks?: Hooks;
  /** Auto-split batches >100 into sequential requests. Default: false */
  chunkBatch?: boolean;
}

export const DEFAULT_BASE_URL = 'https://api.salestaxcalculatorapi.com/v1';
export const DEFAULT_TIMEOUT_MS = 30_000;
export const MAX_BATCH_SIZE = 100;

export const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 2,
  initialDelayMs: 250,
  maxDelayMs: 8_000,
  backoffFactor: 2,
  jitter: true,
};