import {
  DEFAULT_BASE_URL, DEFAULT_RETRY, DEFAULT_TIMEOUT_MS,
  type ClientOptions, type RetryOptions,
} from '../config';
import { ConnectionError, TimeoutError, errorFromResponse, type SalesTaxError } from '../errors';
import { computeDelay, parseRetryAfter } from './retry';
import { buildUserAgent } from './user-agent';
import type { Hooks, RequestOptions } from './types';

export interface HttpRequest {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
  opts?: RequestOptions;
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retry: RetryOptions;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchImpl: typeof fetch;
  private readonly hooks: Hooks;

  constructor(options: ClientOptions) {
    const apiKey = options.apiKey ?? process.env.SALESTAX_API_KEY;
    if (!apiKey) {
      throw new ConnectionError(
        'Missing API key. Pass apiKey or set SALESTAX_API_KEY.',
        { code: 'MISSING_API_KEY', retryable: false },
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retry = { ...DEFAULT_RETRY, ...options.retry };
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.hooks = options.hooks ?? {};
  }

  async send<T>(req: HttpRequest): Promise<T> {
    let attempt = 0;
    let lastError: SalesTaxError | undefined;

    while (attempt <= this.retry.maxRetries) {
      try {
        return await this.execute<T>(req, attempt);
      } catch (err) {
        lastError = err as SalesTaxError;
        const canRetry =
          lastError.retryable === true &&
          attempt < this.retry.maxRetries &&
          req.opts?.retryable !== false;

        if (!canRetry) throw lastError;

        const retryAfterMs =
          (lastError as { retryAfterMs?: number }).retryAfterMs;
        const delay = computeDelay(attempt, this.retry, retryAfterMs);

        this.hooks.onRetry?.({ attempt: attempt + 1, delayMs: delay, error: lastError });
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
      }
    }
    throw lastError!;
  }

  private async execute<T>(req: HttpRequest, attempt: number): Promise<T> {
    const url = `${this.baseUrl}${req.path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': buildUserAgent(),
      ...this.defaultHeaders,
      ...req.opts?.headers,
    };
    if (req.opts?.idempotencyKey) {
      headers['Idempotency-Key'] = req.opts.idempotencyKey;
    }

    const started = Date.now();
    this.hooks.onRequest?.({ method: req.method, url, attempt });

    try {
      const res = await this.fetchImpl(url, {
        method: req.method,
        headers,
        body: req.body ? JSON.stringify(req.body) : undefined,
        signal: req.opts?.signal ?? controller.signal,
      });

      const requestId =
        res.headers.get('x-request-id') ?? res.headers.get('request-id') ?? undefined;

      this.hooks.onResponse?.({
        status: res.status,
        url,
        durationMs: Date.now() - started,
        requestId,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw errorFromResponse(
          res.status,
          body,
          requestId,
          parseRetryAfter(res.headers.get('retry-after')),
        );
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new TimeoutError(this.timeoutMs);
      }
      if (err instanceof Error && !('retryable' in err)) {
        throw new ConnectionError(err.message);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}