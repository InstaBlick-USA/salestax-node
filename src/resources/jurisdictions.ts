import type { Jurisdiction, JurisdictionQuery } from '../models/jurisdiction.js';
import type { HttpClient } from '../transport/http-client.js';
import type { RequestOptions } from '../transport/types.js';

export class JurisdictionsResource {
  constructor(private readonly http: HttpClient) {}

  async list(
    query: JurisdictionQuery = {},
    options: RequestOptions = {},
  ): Promise<Jurisdiction[]> {
    const params = new URLSearchParams();
    if (query.country) params.set('country', query.country);
    if (query.state) params.set('state', query.state);
    const qs = params.toString();

    return this.http.send<Jurisdiction[]>({
      method: 'GET',
      path: `/jurisdictions${qs ? `?${qs}` : ''}`,
      options,
    });
  }
}