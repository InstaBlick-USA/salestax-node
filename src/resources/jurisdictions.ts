// jurisdictions.ts
import type { HttpClient } from '../transport/http-client';
import type { RequestOptions } from '../transport/types';
import type { Jurisdiction, JurisdictionQuery } from '../models/jurisdiction';

export class JurisdictionsResource {
  constructor(private readonly http: HttpClient) {}

  list(query: JurisdictionQuery = {}, opts?: RequestOptions): Promise<Jurisdiction[]> {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v != null) as [string, string][],
    ).toString();
    return this.http.send({
      method: 'GET',
      path: `/jurisdictions${qs ? `?${qs}` : ''}`,
      opts,
    });
  }
}