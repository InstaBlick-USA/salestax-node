import { describe, it, expect } from 'vitest'
import { SalesTaxClient, ValidationError } from '../../src/index'
import { makeMockFetch } from './helpers'

const validParams = {
  currency: 'CAD',
  tax_behavior: 'exclusive' as const,
  billing_event: 'subscription_start' as const,
  seller: {
    country: 'CA',
    channel_role: 'direct_legal_supplier' as const,
    registrations: [
      { country: 'CA', state: 'ON', type: 'gst_hst', effective_from: '2026-01-01' },
    ],
  },
  customer: {
    type: 'consumer' as const,
    address: { country: 'CA', state: 'ON', postal_code: 'M5V 2T6' },
  },
  lines: [{ reference: 'subscription', amount: '100.00', quantity: '1', tax_code: 'saas' }],
}

function makeClient(responses: Parameters<typeof makeMockFetch>[0] = []) {
  const { fn, calls } = makeMockFetch(responses)
  const client = new SalesTaxClient({ apiKey: 'sk_test', fetch: fn })
  return { client, fn, calls }
}

describe('CalculationsResource', () => {
  it('creates a calculation', async () => {
    const { client, calls } = makeClient([
      { status: 201, body: { id: 'calc_01J6A3S8Z6K4M6T2Y2W9M5X8Q0', object: 'calculation', outcome: 'calculated', tax: '13.00' } },
    ])
    const result = await client.calculations.create(validParams, { idempotencyKey: 'order-1001-x' })
    expect(result.outcome).toBe('calculated')
    expect(calls[0]!.url).toMatch(/\/v1\/calculations$/)
    expect(calls[0]!.init.method).toBe('POST')
    const body = JSON.parse(calls[0]!.init.body as string)
    expect(body.currency).toBe('CAD')
    expect(body.seller.channel_role).toBe('direct_legal_supplier')
    expect(body.customer.address.country).toBe('CA')
  })

  it('rejects missing currency', async () => {
    const { client, calls } = makeClient()
    await expect(client.calculations.create({ ...validParams, currency: '' }))
      .rejects.toBeInstanceOf(ValidationError)
    expect(calls.length).toBe(0)
  })

  it('rejects missing seller.country', async () => {
    const { client } = makeClient()
    await expect(
      client.calculations.create({ ...validParams, seller: { ...validParams.seller, country: '' } }),
    ).rejects.toMatchObject({ param: 'seller/country' })
  })

  it('rejects missing customer.address', async () => {
    const { client } = makeClient()
    await expect(
      client.calculations.create({ ...validParams, customer: { type: 'consumer' } as never }),
    ).rejects.toMatchObject({ param: 'customer/address' })
  })

  it('rejects empty lines', async () => {
    const { client } = makeClient()
    await expect(client.calculations.create({ ...validParams, lines: [] }))
      .rejects.toMatchObject({ param: 'lines' })
  })

  it('rejects >100 lines', async () => {
    const { client } = makeClient()
    const lines = Array.from({ length: 101 }, (_, i) => ({
      reference: `line-${i}`, amount: '1.00', tax_code: 'saas',
    }))
    await expect(client.calculations.create({ ...validParams, lines }))
      .rejects.toMatchObject({ code: 'request_too_large' })
  })

  it('rejects malformed amount', async () => {
    const { client } = makeClient()
    await expect(
      client.calculations.create({
        ...validParams,
        lines: [{ reference: 'l1', amount: '1.2345', tax_code: 'saas' }],
      }),
    ).rejects.toMatchObject({ param: 'lines/0/amount' })
  })

  it('gets a calculation', async () => {
    const { client, calls } = makeClient([{ status: 200, body: { id: 'calc_1' } }])
    await client.calculations.get('calc_1')
    expect(calls[0]!.url).toMatch(/\/v1\/calculations\/calc_1$/)
  })

  it('creates a batch', async () => {
    const { client, calls } = makeClient([{ status: 202, body: { id: 'batch_1', status: 'queued' } }])
    await client.calculations.createBatch({ calculations: [validParams] })
    expect(calls[0]!.url).toMatch(/\/v1\/calculation-batches$/)
  })

  it('rejects empty batch', async () => {
    const { client } = makeClient()
    await expect(client.calculations.createBatch({ calculations: [] }))
      .rejects.toMatchObject({ code: 'invalid_request' })
  })

  it('rejects >100 batch entries', async () => {
    const { client } = makeClient()
    const calculations = Array.from({ length: 101 }, () => validParams)
    await expect(client.calculations.createBatch({ calculations }))
      .rejects.toMatchObject({ code: 'request_too_large' })
  })

  it('gets a batch', async () => {
    const { client, calls } = makeClient([{ status: 200, body: { id: 'batch_1' } }])
    await client.calculations.getBatch('batch_1')
    expect(calls[0]!.url).toMatch(/\/v1\/calculation-batches\/batch_1$/)
  })

  it('rejects malformed Idempotency-Key', async () => {
    const { client } = makeClient()
    await expect(
      client.calculations.create(validParams, { idempotencyKey: 'short' }),
    ).rejects.toMatchObject({ code: 'invalid_idempotency_key' })
  })
})