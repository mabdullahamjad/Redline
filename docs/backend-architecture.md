# REDLINE backend foundation

## Data model

- `profiles` extends `auth.users` one-to-one for application-owned user data. Auth credentials and verification state stay in Supabase Auth.
- `economic_events` is the canonical, provider-agnostic macroeconomic calendar. `provider` and `provider_event_id` form its idempotent ingestion key; raw provider payloads are retained in `source_payload` for auditability and parser evolution.
- `subscriptions` is one preference record per user. `target_markets`, `reminder_intervals_minutes`, `timezone`, and `is_active` describe future notification eligibility. The prior `currencies`, `impact_levels`, and `notification_times` columns remain only as a controlled compatibility bridge for the existing application and should be removed when its server functions move to the canonical fields.
- `notification_logs` is the auditable delivery ledger. It links the user, subscription, and economic event, captures provider delivery metadata/failure context, and has an idempotency index for a future scheduler.
- `admin_users` is the service-managed membership allow-list for administrative functionality. It replaces the public role table as the authority for admin status.

## Relationships and indexes

`auth.users` owns `profiles`, `subscriptions`, and `admin_users`; deleting an auth user cascades all user-owned application data. `notification_logs` references a subscription and economic event. Events are preserved by restrictive event deletion through the existing foreign key, protecting the delivery audit trail.

The event-time and `(currency, event_time)` indexes serve calendar reads and time-window synchronization. GIN indexes on event and subscription market arrays support future market matching. The active-subscription partial index targets scheduler candidate selection. Notification logs have user-history, event lookup, and delivery-idempotency indexes.

## RLS and service boundaries

All application tables have RLS enabled. Users may select/update only their own profile, manage only their own subscription, and select only their own notification logs. Authenticated users may read calendar events. No authenticated policy grants inserts, updates, or deletes on `economic_events`; only the service role can synchronize provider data. `admin_users` has no user-facing policy and grants only the service role table access.

`has_role` is a narrowly scoped, security-definer compatibility function: it can report only the caller's own admin status and reads from `admin_users`. It does not expose membership records.

The temporary `events` view is `security_invoker`, so the current frontend's read path continues to observe `economic_events` RLS and receives no elevated database rights.

## Auth review

The existing client already implements password signup, password login, signout, recovery email, reset-password completion, protected TanStack routes, and persisted/auto-refreshed Supabase sessions. No frontend or terminal UI change is required for this foundation.

Before production launch, configure Supabase Auth to require email confirmation and add the deployed `/dashboard` and `/reset-password` URLs to the Auth redirect allow-list. Enforce the final password policy in Supabase Auth rather than relying on client-side validation.

## Future scale

Economic synchronization should run as a service-role Edge Function using `(provider, provider_event_id)` upserts. A scheduler can select active subscriptions via the partial index, match their markets with the GIN-backed arrays, and insert notification rows using the idempotency index before an email worker delivers them. Those operational components are deliberately absent from this foundation.
