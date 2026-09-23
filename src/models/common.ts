export type Currency = string

export type SubdivisionCode = string

export type TaxBehavior = 'exclusive' | 'inclusive'

export type BillingEvent =
  | 'one_time_charge'
  | 'subscription_start'
  | 'subscription_renewal'
  | 'metered_usage'
  | 'free_trial'
  | 'paid_trial'
  | 'discount'
  | 'proration'
  | 'supported_bundle'

export type SellerChannelRole =
  | 'direct_legal_supplier'
  | 'marketplace_operator'
  | 'marketplace_seller'
  | 'merchant_of_record'
  | 'disclosed_agent'
  | 'reseller_principal'

export type CustomerType = 'consumer' | 'business' | 'government' | 'nonprofit'

export type TransactionType = 'sale' | 'refund' | 'credit'

export type Outcome =
  | 'calculated'
  | 'not_taxable'
  | 'not_obligated'
  | 'reverse_charge_or_self_assess'
  | 'exempt'
  | 'no_general_tax'
  | 'review_required'
  | 'unsupported'

export type TaxIdType =
  | 'eu_vat'
  | 'gb_vat'
  | 'gst'
  | 'business_tax_id'
  | 'other'

export type LocationEvidenceKind =
  | 'billing_address'
  | 'ip_address'
  | 'payment_method'
  | 'self_declaration'

export type JurisdictionLevel =
  | 'country'
  | 'state'
  | 'province'
  | 'county'
  | 'city'
  | 'district'
  | 'special'

export interface Address {
  country: string
  line1?: string
  line2?: string
  city?: string
  state?: SubdivisionCode
  postal_code?: string
}

export interface TaxIdInput {
  type: TaxIdType
  country: string
  value: string
}

export interface LocationEvidence {
  kind: LocationEvidenceKind
  country: string
  state?: SubdivisionCode
}

export interface SellerRegistration {
  country: string
  type: string
  effective_from: string
  state?: SubdivisionCode
  effective_to?: string
}

export interface Seller {
  country: string
  channel_role: SellerChannelRole
  registrations: SellerRegistration[]
}

export interface Customer {
  address: Address
  type?: CustomerType
  tax_ids?: TaxIdInput[]
  location_evidence?: LocationEvidence[]
}

export interface CalculationLineCreate {
  reference: string
  amount: string
  tax_code: string
  quantity?: string
  tax_behavior?: TaxBehavior
}

export interface CalculationLine {
  id: string
  reference: string
  outcome: Outcome
  subtotal: string
  taxable_amount: string
  tax: string
  total: string
  explanation?: string
}

export interface Jurisdiction {
  country: string
  level: JurisdictionLevel
  state?: SubdivisionCode
  name?: string
}

export interface TaxComponent {
  jurisdiction: Jurisdiction
  rate: string
  taxable_amount: string
  tax: string
}

export interface EvidenceResult {
  kind: 'customer_address' | 'ship_from' | 'ship_to' | 'tax_id'
  status:
    | 'accepted'
    | 'conflicting'
    | 'missing'
    | 'format_valid'
    | 'format_invalid'
    | 'valid'
    | 'invalid'
    | 'not_checked'
    | 'provider_unavailable'
  authority?: string
  jurisdiction?: string
  checked_at?: string
  consultation_reference?: string
}

export interface AuditExpansion {
  coverage_as_of: string
  source_basis: 'official' | 'licensed'
  components: TaxComponent[]
  evidence: EvidenceResult[]
  effective_from?: string
  effective_through?: string | null
}