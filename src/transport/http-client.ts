import {
  DEFAULT_BASE_URL,
  DEFAULT_RETRY,
  type ClientOptions,
  type RetryPolicy,
} from '../config.js';
import {
  SalesTaxError,
  ValidationError,
  errorFromResponse,
  TimeoutError,
  ConnectionError,
  type ErrorResponseBody,
} from '../errors/index.js';
import { computeDelayMs, parseRetryAfter } from './retry.js';
import { buildUserAgent } from './user-agent.js';
import type { Hooks, RequestOptions } from './types.js';

const REQUEST_ID_HEADERS = ['x-request-id', 'request-id', 'X-Request-Id'] as const;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,254}$/;

interface SendParams {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
  options?: RequestOptions;
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retry: RetryPolicy;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly hooks: Hooks;

  constructor(options: ClientOptions) {
    const apiKey = options.apiKey ?? process.env.SALESTAX_API_KEY;
    if (!apiKey) {
      throw new ConnectionError(
        'Missing API key. Pass `apiKey` or set the SALESTAX_API_KEY environment variable.',
        'MISSING_API_KEY',
        false,
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.retry = { ...DEFAULT_RETRY, ...options.retry };
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.hooks = options.hooks ?? {};
  }

  async send<T>(params: SendParams): Promise<T> {
    const idempotencyKey = params.options?.idempotencyKey;
    if (idempotencyKey !== undefined && !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
      throw new ValidationError(
        'invalid_idempotency_key',
        'Idempotency-Key must be 8-255 characters matching [A-Za-z0-9][A-Za-z0-9._:-]{7,254}',
        { statusCode: 400, param: 'Idempotency-Key' },
      );
    }

    let attempt = 0;
    let lastError: SalesTaxError | undefined;

    while (attempt <= this.retry.maxRetries) {
      try {
        return await this.execute<T>(params, attempt);
      } catch (err) {
        if (!(err instanceof SalesTaxError)) throw err;
        lastError = err;

        const canRetry =
          err.retryable &&
          params.options?.retryable !== false &&
          attempt < this.retry.maxRetries;

        if (!canRetry) throw err;

        const retryAfterMs =
          err instanceof Object && 'retryAfterMs' in err
            ? (err as { retryAfterMs?: number }).retryAfterMs
            : undefined;
        const delay = computeDelayMs(attempt, this.retry, retryAfterMs);

        this.safeHook('onRetry', { attempt: attempt + 1, delayMs: delay, error: err });
        await sleep(delay);
        attempt++;
      }
    }

    throw lastError!;
  }

  private async execute<T>(params: SendParams, attempt: number): Promise<T> {
    const url = this.buildUrl(params);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': buildUserAgent(),
      ...this.defaultHeaders,
      ...params.options?.headers,
    };
    if (params.options?.idempotencyKey) {
      headers['Idempotency-Key'] = params.options.idempotencyKey;
    }

    const startedAt = Date.now();
    this.safeHook('onRequest', { method: params.method, url, attempt });

    try {
      const res = await this.fetchImpl(url, {
        method: params.method,
        headers,
        body: params.body !== undefined ? JSON.stringify(params.body) : undefined,
        signal: params.options?.signal ?? controller.signal,
      });

      const requestId = extractRequestId(res.headers);
      this.safeHook('onResponse', {
        status: res.status,
        url,
        durationMs: Date.now() - startedAt,
        requestId,
      });

      if (!res.ok) {
        const body = (await safeJson(res)) as ErrorResponseBody;
        throw errorFromResponse(
          res.status,
          body,
          requestId,
          parseRetryAfter(res.headers.get('retry-after')),
        );
      }

      return (await safeJson(res)) as T;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new TimeoutError(this.timeoutMs);
      }
      if (err instanceof SalesTaxError) throw err;
      if (err instanceof Error) throw new ConnectionError(err.message);
      throw new ConnectionError(String(err));
    } finally {
      clearTimeout(timer);
    }
  }

  private buildUrl(params: SendParams): string {
    const base = `${this.baseUrl}${params.path}`;
    const expand = params.options?.expand;
    if (!expand) return base;
    const separator = params.path.includes('?') ? '&' : '?';
    return `${base}${separator}expand=${encodeURIComponent(expand)}`;
  }

  private safeHook<K extends keyof Hooks>(name: K, info: Parameters<NonNullable<Hooks[K]>>[0]): void {
    const hook = this.hooks[name];
    if (!hook) return;
    try {
      (hook as (arg: typeof info) => void)(info);
    } catch {
      // Never let a buggy hook break the request flow.
    }
  }
}

function extractRequestId(headers: Headers): string | undefined {
  for (const key of REQUEST_ID_HEADERS) {
    const value = headers.get(key);
    if (value) return value;
  }
  return undefined;
}

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => '');
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}