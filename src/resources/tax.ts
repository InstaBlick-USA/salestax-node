import { MAX_BATCH_SIZE } from '../config.js';
import { ValidationError } from '../errors/index.js';
import type { BatchResult, CalculateTaxParams, TaxCalculation } from '../models/tax.js';
import type { HttpClient } from '../transport/http-client.js';
import type { RequestOptions } from '../transport/types.js';
import { chunk } from '../utils/chunk.js';

function assertAmount(value: unknown): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new ValidationError('INVALID_AMOUNT', 'amount must be a non-negative number', {
      statusCode: 400,
      param: 'amount',
    });
  }
}

function assertTransactions(transactions: readonly CalculateTaxParams[]): void {
  if (transactions.length === 0) {
    throw new ValidationError('EMPTY_BATCH', 'Batch must contain at least one transaction', {
      statusCode: 400,
    });
  }
}

export interface TaxCalculateArgs extends CalculateTaxParams {
  idempotencyKey?: string;
  retryable?: boolean;
  signal?: AbortSignal;
}

export class TaxResource {
  constructor(
    private readonly http: HttpClient,
    private readonly chunkBatch: boolean,
  ) {}

  async calculate(args: TaxCalculateArgs): Promise<TaxCalculation> {
    const { zipCode, amount, state, country, city, idempotencyKey, retryable, signal } = args;

    if (!zipCode) {
      throw new ValidationError('MISSING_PARAM', 'zipCode is required', {
        statusCode: 400,
        param: 'zipCode',
      });
    }
    assertAmount(amount);

    const payload: Record<string, unknown> = { zipCode, amount };
    if (state !== undefined) payload.state = state;
    if (country !== undefined) payload.country = country;
    if (city !== undefined) payload.city = city;

    return this.http.send<TaxCalculation>({
      method: 'POST',
      path: '/calculate',
      body: payload,
      options: { idempotencyKey, retryable, signal },
    });
  }

  async calculateBatch(
    transactions: readonly CalculateTaxParams[],
    options: RequestOptions = {},
  ): Promise<BatchResult> {
    assertTransactions(transactions);
    if (transactions.length > MAX_BATCH_SIZE && !this.chunkBatch) {
      throw new ValidationError(
        'BATCH_LIMIT_EXCEEDED',
        `Batch is limited to ${MAX_BATCH_SIZE} transactions. Use calculateBatchChunked() or enable chunkBatch=true.`,
        { statusCode: 400 },
      );
    }
    for (const t of transactions) assertAmount(t.amount);

    return this.http.send<BatchResult>({
      method: 'POST',
      path: '/calculate/batch',
      body: { transactions },
      options,
    });
  }

  async calculateBatchChunked(
    transactions: readonly CalculateTaxParams[],
    options: RequestOptions = {},
  ): Promise<BatchResult> {
    assertTransactions(transactions);
    for (const t of transactions) assertAmount(t.amount);

    const results: TaxCalculation[] = [];
    for (const batch of chunk(transactions, MAX_BATCH_SIZE)) {
      const res = await this.http.send<BatchResult>({
        method: 'POST',
        path: '/calculate/batch',
        body: { transactions: batch },
        options,
      });
      results.push(...(res.results ?? []));
    }
    return { results, count: results.length };
  }
}