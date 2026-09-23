import { describe, it, expect } from 'vitest'
import { SalesTaxClient } from '../../src/index'
import { makeMockFetch } from './helpers'

function makeClient(responses: Parameters<typeof makeMockFetch>[0] = []) {
  const { fn, calls } = makeMockFetch(responses)
  const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn })
  return { client, fn, calls }
}

describe('TransactionsResource', () => {
  it('creates a transaction', async () => {
    const { client, calls } = makeClient([{ status: 201, body: { id: 'txn_1', object: 'transaction' } }])
    const result = await client.transactions.create(
      { calculation_id: 'calc_1', reference: 'order-1001' },
      { idempotencyKey: 'order-1001-txn' },
    )
    expect(result.id).toBe('txn_1')
    expect(calls[0]!.url).toMatch(/\/v1\/transactions$/)
  })

  it('rejects missing calculation_id', async () => {
    const { client } = makeClient()
    await expect(
      client.transactions.create({ calculation_id: '', reference: 'r' }),
    ).rejects.toMatchObject({ param: 'calculation_id' })
  })

  it('rejects missing reference', async () => {
    const { client } = makeClient()
    await expect(
      client.transactions.create({ calculation_id: 'calc_1', reference: '' }),
    ).rejects.toMatchObject({ param: 'reference' })
  })

  it('gets a transaction', async () => {
    const { client, calls } = makeClient([{ status: 200, body: { id: 'txn_1' } }])
    await client.transactions.get('txn_1')
    expect(calls[0]!.url).toMatch(/\/v1\/transactions\/txn_1$/)
  })
})