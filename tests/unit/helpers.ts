import { vi } from 'vitest';

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  throw?: Error;
}

type FetchInput = Parameters<typeof globalThis.fetch>[0];
type FetchInit = Parameters<typeof globalThis.fetch>[1];

/**
 * Build a fake `fetch` that returns queued responses in order.
 * Records every call for assertion.
 */
export function makeMockFetch(responses: MockResponse[]) {
  let index = 0;
  const calls: Array<{ url: string; init: RequestInit }> = [];

  const fn = vi.fn(async (input: FetchInput, init?: FetchInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    const spec = responses[index++];
    if (!spec) {
      throw new Error(
        `Mock fetch called ${index} times, only ${responses.length} responses queued`,
      );
    }
    if (spec.throw) throw spec.throw;

    const status = spec.status ?? 200;
    const headers = new Headers(spec.headers ?? {});
    const body = spec.body === undefined ? '{}' : JSON.stringify(spec.body);

    return new Response(body, { status, headers });
  }) as unknown as typeof fetch;

  return { fn, calls };
}