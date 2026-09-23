export const DEFAULT_BASE_URL = 'https://api.salestaxcalculatorapi.com'
export const DEFAULT_TIMEOUT_MS = 30_000
export const MAX_BATCH_SIZE = 100
export const MAX_LINES_PER_CALCULATION = 100
export const MAX_LINES_PER_ADJUSTMENT = 100
export const MAX_REGISTRATIONS = 100
export const ENV_API_KEY = 'SALESTAX_API_KEY'

export interface RetryPolicy {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffFactor: number
  jitter: boolean
}

export const DEFAULT_RETRY: RetryPolicy = {
  maxRetries: 2,
  initialDelayMs: 250,
  maxDelayMs: 8_000,
  backoffFactor: 2,
  jitter: true,
}

export interface ClientOptions {
  apiKey?: string
  baseUrl?: string
  timeoutMs?: number
  retry?: Partial<RetryPolicy>
  defaultHeaders?: Record<string, string>
  fetch?: typeof globalThis.fetch
  hooks?: import('./transport/types').Hooks
}