# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-09-23

### Fixed

- Replaced the obsolete pre-0.2 README examples with the current resource API.
- Documented transactions, adjustments, batches, coverage checks, audit expansion, typed errors, idempotency, and client defaults.
- Standardized setup examples on `SALESTAX_API_KEY` and the public API base URL.

This release changes package documentation only. The request and response API is unchanged from 0.2.0.

## [0.2.0] - 2026-09-23

### Changed

**BREAKING:** Redesigned the SDK to match the public OpenAPI contract.

- Replaced `client.tax`, `client.rates`, `client.jurisdictions` with
  `client.calculations`, `client.transactions`, `client.transactions.adjustments`,
  `client.batches`, and `client.coverage`.
- Request and response shapes now use snake_case matching the OpenAPI spec.
- Money and quantity are decimal strings, matching the wire format.
- Idempotency-Key is validated client-side against `[A-Za-z0-9][A-Za-z0-9._:-]{7,254}`.
- Error bodies are parsed as RFC 9457 problem+json. Field-level errors
  populate `err.param` from `errors[0].pointer`.
- Base URL is now `https://api.salestaxcalculatorapi.com` (no `/v1` suffix).
- Added `expand: 'audit'` request option.

### Removed

- `client.tax.calculate`, `client.tax.calculateBatch`, `client.tax.calculateBatchChunked`
- `client.rates.get`
- `client.jurisdictions.list`
- `src/utils/chunk.ts`

## [0.1.0] - 2026-09-22

Initial release.
