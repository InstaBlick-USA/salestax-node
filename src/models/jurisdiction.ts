export interface Jurisdiction {
  code?: string;
  name?: string;
  country?: string;
  state?: string | null;
  type?: string;
}

export interface JurisdictionQuery {
  country?: string;
  state?: string;
}