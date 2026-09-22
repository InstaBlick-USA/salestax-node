import { describe, it, expect } from 'vitest';
import { chunk, redact } from '../../src/utils/index.js';

describe('chunk', () => {
  it('handles empty input', () => {
    expect(chunk([], 10)).toEqual([]);
  });

  it('splits exact multiples', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  it('handles partial last chunk', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('rejects zero size', () => {
    expect(() => chunk([1], 0)).toThrow(/positive/);
  });

  it('rejects negative size', () => {
    expect(() => chunk([1], -1)).toThrow();
  });
});

describe('redact', () => {
  it('fully redacts short values', () => {
    expect(redact('abc')).toBe('***');
  });

  it('fully redacts exact length', () => {
    expect(redact('abcd')).toBe('****');
  });

  it('keeps suffix on longer values', () => {
    expect(redact('sk_live_abc123', 4)).toBe('**********c123');
  });

  it('honors custom keep', () => {
    expect(redact('1234567890', 2)).toBe('********90');
  });
});