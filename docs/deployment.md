# REDLINE deployment guide

## Local development

Install Node.js 20+ and run `npm ci`, then `npm run dev`. Create a local `.env` from the environment variables below. It is intentionally git-ignored.

Run the release checks before merging:

```sh
npm run lint
npm exec tsc -- --noEmit
npm run build
```

## Frontend environment

Set these in Vercel and locally. These are public Supabase connection values, not service-role credentials.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL` (server rendering/server functions)
- `SUPABASE_PUBLISHABLE_KEY` (server rendering/server functions)

Never set `SUPABASE_SERVICE_ROLE_KEY`, `FMP_API_KEY`, Resend keys, or scheduler secrets as `VITE_` variables.

## Supabase

1. Create the production project and apply every migration in `supabase/migrations` in timestamp order.
2. Deploy `sync-economic-events` and `run-notification-pipeline` Edge Functions.
3. Set Edge Function secrets: `FMP_API_KEY`, `ECONOMIC_SYNC_SECRET`, `NOTIFICATION_PIPELINE_SECRET`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL`. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions.
4. In Supabase Auth, require email confirmation and add these redirect URLs: `https://<domain>/dashboard` and `https://<domain>/reset-password`.
5. Provision admin membership using the service-managed `admin_users` path; never grant it from the browser.

## Scheduler

Use a trusted external scheduler or Supabase Cron to send authenticated `POST` requests. Run FMP sync at least every 15 minutes and the notification pipeline every minute. Pass only the required secret header:

```sh
curl -X POST "$SUPABASE_URL/functions/v1/sync-economic-events" \
  -H "x-economic-sync-secret: $ECONOMIC_SYNC_SECRET"

curl -X POST "$SUPABASE_URL/functions/v1/run-notification-pipeline" \
  -H "x-notification-pipeline-secret: $NOTIFICATION_PIPELINE_SECRET"
```

The notification pipeline is idempotent at both the database and Resend layers. It claims jobs with row locks, retries transient failures with bounded backoff, and keeps delivery records for audit.

## Resend

Verify the sending domain in Resend, then set `RESEND_FROM_EMAIL` to a verified address such as `alerts@your-domain.com`. Keep the API key only in Supabase Edge Function secrets. Monitor failed jobs in REDLINE's Admin control center and Resend's delivery activity.

## Vercel

Import the repository, use the default Vite/TanStack Start build command (`npm run build`), and set the four frontend/server environment variables above for Production, Preview, and Development as appropriate. Configure the production domain before setting Supabase Auth redirect URLs.

## Troubleshooting

- **No calendar events:** inspect the `sync-economic-events` function logs, FMP key, and scheduler header.
- **Notifications pending:** verify the pipeline runs each minute and `RESEND_*` secrets are configured.
- **Notifications failed:** inspect the sanitized `notification_logs.error_message`, then Resend delivery activity.
- **Unauthorized scheduler request:** rotate and update the matching scheduler secret header.
- **Admin metrics unavailable:** confirm the account has a service-managed admin membership and that migrations have been applied.
