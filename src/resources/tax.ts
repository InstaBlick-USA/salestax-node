import { MAX_BATCH_SIZE } from '../config';
import { ValidationError } from '../errors';
import type { HttpClient } from '../transport/http-client';
import type { RequestOptions } from '../transport/types';
import type { CalculateTaxParams, TaxCalculation, BatchResult } from '../models/tax';
import { chunk } from '../utils/chunk';

export class TaxResource {
  constructor(
    private readonly http: HttpClient,
    private readonly chunkBatch: boolean,
  ) {}

  calculate(params: CalculateTaxParams, opts?: RequestOptions): Promise<TaxCalculation> {
    this.assertAmount(params.amount);
    if (!params.zipCode) throw new ValidationError('MISSING_PARAM', 'zipCode is required', { statusCode: 400, param: 'zipCode' });
    return this.http.send({ method: 'POST', path: '/calculate', body: params, opts });
  }

  calculateBatch(
    transactions: CalculateTaxParams[],
    opts?: RequestOptions,
  ): Promise<BatchResult> {
    if (transactions.length === 0) {
      throw new ValidationError('EMPTY_BATCH', 'Batch must contain at least one transaction', { statusCode: 400 });
    }
    if (transactions.length > MAX_BATCH_SIZE && !this.chunkBatch) {
      throw new ValidationError(
        'BATCH_LIMIT_EXCEEDED',
        `Batch limited to ${MAX_BATCH_SIZE} transactions. Enable chunkBatch or split manually.`,
        { statusCode: 400 },
      );
    }
    transactions.forEach((t) => this.assertAmount(t.amount));
    return this.http.send({
      method: 'POST',
      path: '/calculate/batch',
      body: { transactions },
      opts,
    });
  }

  async calculateBatchChunked(
    transactions: CalculateTaxParams[],
    opts?: RequestOptions,
  ): Promise<BatchResult> {
    const batches = chunk(transactions, MAX_BATCH_SIZE);
    const results: BatchResult['results'] = [];
    for (const batch of batches) {
      const res = await this.calculateBatch(batch, opts);
      results.push(...res.results);
    }
    return { results, count: results.length };
  }

  private assertAmount(amount: number): void {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      throw new ValidationError('INVALID_AMOUNT', 'amount must be a non-negative finite number', { statusCode: 400, param: 'amount' });
    }
  }
}