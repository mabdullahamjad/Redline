-- REDLINE backend foundation.
-- This is a forward-only migration from the original EventPulse schema. The
-- compatibility columns retained on subscriptions are intentionally temporary;
-- application code can be moved to the canonical fields in a later release.

CREATE TYPE public.market_asset AS ENUM (
  'forex',
  'bitcoin',
  'ethereum',
  'gold',
  'silver',
  'major_indices'
);

CREATE TYPE public.notification_status AS ENUM ('sent', 'failed', 'skipped');

CREATE OR REPLACE FUNCTION public.all_positive_smallint(input_values smallint[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT cardinality(input_values) > 0
     AND COALESCE(bool_and(interval_minutes > 0), false)
  FROM unnest(input_values) AS expanded(interval_minutes);
$$;

-- Profiles are a first-class extension of auth.users. Authentication identity
-- remains exclusively owned by Supabase Auth.
ALTER TABLE public.profiles
  ADD COLUMN display_name text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.profiles SET updated_at = created_at WHERE updated_at IS NULL;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Rename the canonical calendar table; PostgreSQL carries existing foreign
-- keys across the rename. `event_time` is retained as the precise scheduled
-- timestamp to avoid an unsafe, application-breaking column rename.
ALTER TABLE public.events RENAME TO economic_events;

ALTER TABLE public.economic_events
  ADD COLUMN provider text NOT NULL DEFAULT 'financial_modeling_prep',
  ADD COLUMN provider_event_id text,
  ADD COLUMN market_assets public.market_asset[] NOT NULL
    DEFAULT ARRAY['forex']::public.market_asset[],
  ADD COLUMN source_payload jsonb,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ADD CONSTRAINT economic_events_provider_not_blank CHECK (btrim(provider) <> ''),
  ADD CONSTRAINT economic_events_market_assets_not_empty CHECK (cardinality(market_assets) > 0);

UPDATE public.economic_events
SET provider_event_id = id::text
WHERE provider_event_id IS NULL;

ALTER TABLE public.economic_events
  ALTER COLUMN provider_event_id SET NOT NULL,
  ADD CONSTRAINT economic_events_provider_event_id_key UNIQUE (provider, provider_event_id);

CREATE TRIGGER update_economic_events_updated_at
  BEFORE UPDATE ON public.economic_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX economic_events_event_time_idx
  ON public.economic_events (event_time ASC);
CREATE INDEX economic_events_market_assets_gin_idx
  ON public.economic_events USING gin (market_assets);
CREATE INDEX economic_events_currency_event_time_idx
  ON public.economic_events (currency, event_time ASC);

-- One active preference record per user. The canonical market/interval fields
-- are separate from the legacy UI fields during this backend-only release.
ALTER TABLE public.subscriptions
  ADD COLUMN target_markets public.market_asset[] NOT NULL
    DEFAULT ARRAY['forex']::public.market_asset[],
  ADD COLUMN reminder_intervals_minutes smallint[] NOT NULL
    DEFAULT ARRAY[60, 1440]::smallint[],
  ADD COLUMN timezone text NOT NULL DEFAULT 'UTC',
  ADD COLUMN is_active boolean NOT NULL DEFAULT true,
  ADD CONSTRAINT subscriptions_target_markets_not_empty CHECK (cardinality(target_markets) > 0),
  ADD CONSTRAINT subscriptions_reminder_intervals_not_empty CHECK (cardinality(reminder_intervals_minutes) > 0),
  ADD CONSTRAINT subscriptions_reminder_intervals_positive
    CHECK (public.all_positive_smallint(reminder_intervals_minutes)),
  ADD CONSTRAINT subscriptions_timezone_not_blank CHECK (btrim(timezone) <> '');

CREATE INDEX subscriptions_active_user_idx
  ON public.subscriptions (user_id)
  WHERE is_active;
CREATE INDEX subscriptions_target_markets_gin_idx
  ON public.subscriptions USING gin (target_markets);

-- Notification delivery is append-only from the application perspective. It
-- records enough state for a future scheduler/email worker to be idempotent.
ALTER TABLE public.notification_logs
  ADD COLUMN subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  ADD COLUMN reminder_interval_minutes smallint,
  ADD COLUMN status public.notification_status NOT NULL DEFAULT 'sent',
  ADD COLUMN provider_message_id text,
  ADD COLUMN failure_reason text,
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

UPDATE public.notification_logs AS log
SET subscription_id = subscription.id
FROM public.subscriptions AS subscription
WHERE subscription.user_id = log.user_id
  AND log.subscription_id IS NULL;

ALTER TABLE public.notification_logs
  ALTER COLUMN subscription_id SET NOT NULL,
  ADD CONSTRAINT notification_logs_interval_positive CHECK (
    reminder_interval_minutes IS NULL OR reminder_interval_minutes > 0
  ),
  ADD CONSTRAINT notification_logs_failure_reason_consistent CHECK (
    (status <> 'failed') OR failure_reason IS NOT NULL
  );

CREATE UNIQUE INDEX notification_logs_delivery_idempotency_idx
  ON public.notification_logs (subscription_id, event_id, reminder_interval_minutes)
  WHERE reminder_interval_minutes IS NOT NULL;
CREATE INDEX notification_logs_user_created_at_idx
  ON public.notification_logs (user_id, created_at DESC);
CREATE INDEX notification_logs_event_id_idx
  ON public.notification_logs (event_id);

-- Admin membership is intentionally not readable through PostgREST by normal
-- users. Service-role code manages membership; has_role only reports the
-- caller's own membership for existing protected server functions.
CREATE TABLE public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT admin_users_created_by_not_self CHECK (created_by IS NULL OR created_by <> user_id)
);

INSERT INTO public.admin_users (user_id, created_at)
SELECT user_id, min(created_at)
FROM public.user_roles
WHERE role = 'admin'
GROUP BY user_id
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon, authenticated;
GRANT ALL ON public.admin_users TO service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT _role = 'admin'
     AND _user_id = auth.uid()
     AND EXISTS (
       SELECT 1
       FROM public.admin_users
       WHERE user_id = auth.uid()
     );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- RLS: public calendar reads, service-role-only calendar writes.
DROP POLICY IF EXISTS "Authenticated read events" ON public.economic_events;
DROP POLICY IF EXISTS "Admins insert events" ON public.economic_events;
DROP POLICY IF EXISTS "Admins update events" ON public.economic_events;
DROP POLICY IF EXISTS "Admins delete events" ON public.economic_events;
REVOKE INSERT, UPDATE, DELETE ON public.economic_events FROM authenticated;
GRANT SELECT ON public.economic_events TO authenticated;
CREATE POLICY "Authenticated users can read economic events"
  ON public.economic_events FOR SELECT TO authenticated USING (true);

-- RLS: explicitly limit every user-owned relation to its owner. Service role
-- bypasses RLS and is the only future scheduler/email writer.
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
REVOKE INSERT, DELETE ON public.profiles FROM authenticated;

DROP POLICY IF EXISTS "Users manage own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins read all subscriptions" ON public.subscriptions;
CREATE POLICY "Users can manage their own subscriptions"
  ON public.subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own logs" ON public.notification_logs;
DROP POLICY IF EXISTS "Admins read all logs" ON public.notification_logs;
CREATE POLICY "Users can read their own notification logs"
  ON public.notification_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.notification_logs FROM authenticated;

-- The old table name remains a security-invoker compatibility view for the
-- existing frontend. It cannot bypass economic_events RLS.
CREATE VIEW public.events
WITH (security_invoker = true)
AS SELECT * FROM public.economic_events;

GRANT SELECT ON public.events TO authenticated;

-- Remove direct authenticated access to obsolete role storage. The canonical
-- admin_users table above is service-role-only.
REVOKE ALL ON public.user_roles FROM anon, authenticated;
