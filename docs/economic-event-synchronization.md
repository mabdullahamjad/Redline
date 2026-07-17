# Economic-event synchronization

`sync-economic-events` is a server-only Supabase Edge Function. It fetches FMP's Economic Calendar endpoint, validates and UTC-normalizes records, compares them to the canonical `economic_events` rows, and upserts only new or changed events. No browser code communicates with FMP and the FMP key is read exclusively from Edge Function secrets.

## Deployment configuration

Configure these secrets with the Supabase CLI or dashboard; never add them to a Vite-prefixed environment variable or the frontend `.env` file.

- `FMP_API_KEY`: Financial Modeling Prep API key.
- `ECONOMIC_SYNC_SECRET`: high-entropy secret required in the `x-economic-sync-secret` request header.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: provided to the Edge Function runtime.
- Optional `FMP_SYNC_LOOKBACK_DAYS` (default `7`) and `FMP_SYNC_HORIZON_DAYS` (default `90`).

Invoke the function with an authenticated server-to-server `POST`; there is intentionally no cron configuration in this repository. A future scheduler should call this exact entry point and pass `x-economic-sync-secret`.

## Normalization and duplicate prevention

FMP's calendar response does not provide a dependable event identifier. REDLINE therefore creates a SHA-256 provider key from the provider name, normalized title, country, currency, and UTC event timestamp. The key intentionally excludes actual/forecast/previous values, allowing later data releases to update the same event. Records missing any required field, malformed dates, unsupported impacts, or non-ISO currency codes are logged and skipped without failing the full sync.

The repository reads existing rows in bounded batches, performs a semantic comparison, and submits only inserts or changed records using the database unique key `(provider, provider_event_id)`. It is therefore safe to invoke repeatedly without creating duplicates or rewriting unchanged rows.

## Expiration and retention

Historical economic events are retained for analytics and auditability. The service marks past events as `is_expired` with an `expired_at` timestamp; it never deletes them. A partial index keeps upcoming-calendar queries fast while preserving the full history.

## Reliability and observability

The FMP client uses a 12-second timeout and retries transient network errors, `408`, `429`, and `5xx` responses with bounded exponential backoff, respecting `Retry-After`. Response shape is checked before normalization. Structured JSON logs emit start, fetch, individual skip, completion, unauthorized request, and failure events without logging API secrets or raw provider payloads.

FMP documents the stable economic-calendar endpoint and API-key authorization: [Economic Calendar](https://site.financialmodelingprep.com/developer/docs/stable/economics-calendar), [API basics](https://site.financialmodelingprep.com/developer/docs/quickstart).

## Verification

Run `deno test --allow-net supabase/functions/_shared/economic-sync` in a Deno-capable environment before deployment. The tests cover UTC normalization and deterministic IDs, malformed-record rejection, API-key request construction, rate-limit retries, and invalid-response rejection. No test data is written to Supabase or exposed to the application.
