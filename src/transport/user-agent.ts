import { version } from '../version';

export function buildUserAgent(): string {
  const runtime = `node/${process.versions.node}`;
  const platform = `${process.platform}/${process.arch}`;
  return `salestax-node/${version} (${runtime}; ${platform})`;
}