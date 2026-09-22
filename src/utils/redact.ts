/** Redact all but the last `keep` characters. */
export function redact(value: string, keep = 4): string {
  if (value.length <= keep) return '*'.repeat(value.length);
  return '*'.repeat(value.length - keep) + value.slice(-keep);
}