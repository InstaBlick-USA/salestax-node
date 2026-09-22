/**
 * Configuration and defaults for the SDK.
 */

export const DEFAULT_BASE_URL = 'https://api.salestaxcalculatorapi.com/v1';
export const DEFAULT_TIMEOUT_MS = 30_000;
export const MAX_BATCH_SIZE = 100;
export const ENV_API_KEY = 'SALESTAX_API_KEY';

export interface RetryPolicy {
  /** Number of retries *after* the initial attempt. Default: 2 */
  maxRetries: number;
  /** Base delay in milliseconds for the first retry. Default: 250 */
  initialDelayMs: number;
  /** Ceiling for any single delay. Default: 8000 */
  maxDelayMs: number;
  /** Exponential multiplier applied per attempt. Default: 2 */
  backoffFactor: number;
  /** Apply full jitter to each computed delay. Default: true */
  jitter: boolean;
}

export const DEFAULT_RETRY: RetryPolicy = {
  maxRetries: 2,
  initialDelayMs: 250,
  maxDelayMs: 8_000,
  backoffFactor: 2,
  jitter: true,
};

export interface ClientOptions {
  /**
   * API key. Falls back to the `SALESTAX_API_KEY` environment variable
   * when omitted.
   */
  apiKey?: string;
  /** Override the API base URL. */
  baseUrl?: string;
  /** Per-request timeout in milliseconds. Default: 30000 */
  timeoutMs?: number;
  /** Custom retry policy. Partial overrides merge with defaults. */
  retry?: Partial<RetryPolicy>;
  /** Headers merged into every request. */
  defaultHeaders?: Record<string, string>;
  /**
   * Inject a `fetch` implementation (testing, edge runtimes).
   * Defaults to `globalThis.fetch`.
   */
  fetch?: typeof globalThis.fetch;
  /** Lifecycle hooks for logging and telemetry. */
  hooks?: import('./transport/types.js').Hooks;
  /**
   * If `true`, `calculateBatch` automatically splits inputs larger than
   * `MAX_BATCH_SIZE` into sequential requests.
   */
  chunkBatch?: boolean;
}