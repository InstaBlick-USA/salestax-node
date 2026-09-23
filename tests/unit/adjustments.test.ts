import { describe, it, expect } from 'vitest'
import { SalesTaxClient } from '../../src/index'
import { makeMockFetch } from './helpers'

function makeClient(responses: Parameters<typeof makeMockFetch>[0] = []) {
  const { fn, calls } = makeMockFetch(responses)
  const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn })
  return { client, fn, calls }
}

describe('AdjustmentsResource', () => {
  it('creates an amount-based adjustment', async () => {
    const { client, calls } = makeClient([{ status: 201, body: { id: 'adj_1', object: 'adjustment' } }])
    await client.transactions.adjustments.create(
      'txn_1',
      {
        reference: 'refund-1001',
        reason: 'refund',
        lines: [{ line_id: 'line_1', amount: '25.00' }],
      },
      { idempotencyKey: 'refund-1001-adj' },
    )
    expect(calls[0]!.url).toMatch(/\/v1\/transactions\/txn_1\/adjustments$/)
  })

  it('creates a quantity-based adjustment', async () => {
    const { client, calls } = makeClient([{ status: 201, body: { id: 'adj_1' } }])
    await client.transactions.adjustments.create('txn_1', {
      reference: 'refund-1001',
      reason: 'refund',
      lines: [{ line_id: 'line_1', quantity: '0.5' }],
    })
    expect(calls.length).toBe(1)
  })

  it('rejects invalid reason', async () => {
    const { client } = makeClient()
    await expect(
      client.transactions.adjustments.create('txn_1', {
        reference: 'r',
        reason: 'invalid' as never,
        lines: [{ line_id: 'line_1', amount: '1.00' }],
      }),
    ).rejects.toMatchObject({ param: 'reason' })
  })

  it('rejects empty lines', async () => {
    const { client } = makeClient()
    await expect(
      client.transactions.adjustments.create('txn_1', {
        reference: 'r', reason: 'refund', lines: [],
      }),
    ).rejects.toMatchObject({ param: 'lines' })
  })

  it('rejects line missing amount and quantity', async () => {
    const { client } = makeClient()
    await expect(
      client.transactions.adjustments.create('txn_1', {
        reference: 'r',
        reason: 'refund',
        lines: [{ line_id: 'line_1' } as never],
      }),
    ).rejects.toMatchObject({ param: 'lines/0' })
  })

  it('lists adjustments with pagination', async () => {
    const { client, calls } = makeClient([
      { status: 200, body: { object: 'list', items: [], has_more: false } },
    ])
    await client.transactions.adjustments.list('txn_1', { limit: 20, starting_after: 'cur_1' })
    expect(calls[0]!.url).toContain('limit=20')
    expect(calls[0]!.url).toContain('starting_after=cur_1')
  })

  it('gets an adjustment', async () => {
    const { client, calls } = makeClient([{ status: 200, body: { id: 'adj_1' } }])
    await client.transactions.adjustments.get('txn_1', 'adj_1')
    expect(calls[0]!.url).toMatch(/\/v1\/transactions\/txn_1\/adjustments\/adj_1$/)
  })
})