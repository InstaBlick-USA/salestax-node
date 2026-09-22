export interface CalculateTaxParams {
  zipCode: string;
  amount: number;
  state?: string;
  country?: string;
  city?: string;
}

export interface TaxBreakdownEntry {
  jurisdiction?: string;
  name?: string;
  rate?: number;
  amount?: number;
}

export interface TaxCalculation {
  taxAmount?: number;
  totalAmount?: number;
  rate?: number;
  jurisdiction?: string;
  breakdown?: TaxBreakdownEntry[];
}

export interface BatchResult {
  results: TaxCalculation[];
  count: number;
}