import { VERSION } from '../version.js';

/** Return a stable, informative User-Agent string. */
export function buildUserAgent(): string {
  const runtime = `node/${process.versions.node}`;
  const os = `${process.platform}/${process.arch}`;
  return `salestax-node/${VERSION} (${runtime}; ${os})`;
}