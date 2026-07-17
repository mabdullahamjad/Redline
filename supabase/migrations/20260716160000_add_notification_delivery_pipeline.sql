ALTER TABLE public.notification_logs
  ADD COLUMN recipient_email text,
  ADD COLUMN attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN last_attempt_at timestamptz,
  ADD COLUMN error_message text,
  ADD COLUMN processing_started_at timestamptz,
  ADD COLUMN locked_until timestamptz,
  ADD CONSTRAINT notification_logs_attempt_count_nonnegative CHECK (attempt_count >= 0);

ALTER TABLE public.notification_logs
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN subscription_id DROP NOT NULL,
  ALTER COLUMN reminder_interval_minutes SET NOT NULL,
  ALTER COLUMN sent_at DROP NOT NULL,
  ALTER COLUMN sent_at DROP DEFAULT;

ALTER TABLE public.notification_logs
  DROP CONSTRAINT notification_logs_user_id_fkey,
  ADD CONSTRAINT notification_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  DROP CONSTRAINT notification_logs_subscription_id_fkey,
  ADD CONSTRAINT notification_logs_subscription_id_fkey
    FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  DROP CONSTRAINT notification_logs_event_id_fkey,
  ADD CONSTRAINT notification_logs_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.economic_events(id) ON DELETE RESTRICT;

CREATE INDEX notification_logs_pending_jobs_idx
  ON public.notification_logs (created_at ASC)
  WHERE status = 'pending';
CREATE INDEX notification_logs_processing_timeout_idx
  ON public.notification_logs (locked_until ASC)
  WHERE status = 'processing';

CREATE POLICY "Admins can read operational notification logs"
  ON public.notification_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can read operational profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can read operational subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.generate_due_notification_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE inserted_count integer;
BEGIN
  INSERT INTO public.notification_logs (
    user_id, subscription_id, event_id, notification_type, reminder_interval_minutes,
    status, recipient_email
  )
  SELECT DISTINCT
    subscriptions.user_id, subscriptions.id, events.id, 'email', reminder.interval_minutes,
    'pending'::public.notification_status, users.email
  FROM public.economic_events AS events
  JOIN public.subscriptions AS subscriptions ON subscriptions.is_active
  JOIN public.subscription_market_preferences AS preference ON preference.subscription_id = subscriptions.id
  JOIN auth.users AS users ON users.id = subscriptions.user_id
  CROSS JOIN LATERAL unnest(subscriptions.reminder_intervals_minutes) AS reminder(interval_minutes)
  WHERE events.event_time > now()
    AND events.event_time <= now() + interval '25 hours'
    AND events.event_time - make_interval(mins => reminder.interval_minutes) <= now()
    AND (
      (preference.market = 'forex' AND events.market_assets @> ARRAY['forex']::public.market_asset[] AND (preference.asset_code IS NULL OR events.currency = preference.asset_code))
      OR (preference.market = 'crypto' AND ((preference.asset_code = 'BTC' AND events.market_assets @> ARRAY['bitcoin']::public.market_asset[]) OR (preference.asset_code = 'ETH' AND events.market_assets @> ARRAY['ethereum']::public.market_asset[]) OR (preference.asset_code IS NULL AND events.market_assets && ARRAY['bitcoin','ethereum']::public.market_asset[])))
      OR (preference.market = 'metals' AND ((preference.asset_code = 'XAU' AND events.market_assets @> ARRAY['gold']::public.market_asset[]) OR (preference.asset_code = 'XAG' AND events.market_assets @> ARRAY['silver']::public.market_asset[]) OR (preference.asset_code IS NULL AND events.market_assets && ARRAY['gold','silver']::public.market_asset[])))
      OR (preference.market = 'indices' AND events.market_assets @> ARRAY['major_indices']::public.market_asset[])
    )
  ON CONFLICT (subscription_id, event_id, reminder_interval_minutes) DO NOTHING;
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_notification_jobs(_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, recipient_email text, title text, country text, currency text, impact public.impact_level, event_time timestamptz, market_assets public.market_asset[], reminder_interval_minutes smallint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH claimed AS (
    SELECT logs.id
    FROM public.notification_logs AS logs
    WHERE (
      (logs.status = 'pending' AND (logs.locked_until IS NULL OR logs.locked_until <= now()))
      OR (logs.status = 'processing' AND logs.locked_until < now())
    )
      AND logs.attempt_count < 5
    ORDER BY logs.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT greatest(1, least(_limit, 100))
  ), updated AS (
    UPDATE public.notification_logs AS logs
    SET status = 'processing', attempt_count = attempt_count + 1, last_attempt_at = now(), processing_started_at = now(), locked_until = now() + interval '5 minutes', error_message = NULL
    FROM claimed WHERE logs.id = claimed.id
    RETURNING logs.*
  )
  SELECT updated.id, updated.recipient_email, events.title, events.country, events.currency, events.impact, events.event_time, events.market_assets, updated.reminder_interval_minutes
  FROM updated JOIN public.economic_events AS events ON events.id = updated.event_id;
$$;

CREATE OR REPLACE FUNCTION public.complete_notification_job(_id uuid, _provider_message_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.notification_logs SET status = 'sent', sent_at = now(), provider_message_id = _provider_message_id, locked_until = NULL WHERE id = _id AND status = 'processing';
$$;

CREATE OR REPLACE FUNCTION public.fail_notification_job(_id uuid, _error_message text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.notification_logs
  SET status = CASE WHEN attempt_count >= 5 THEN 'failed'::public.notification_status ELSE 'pending'::public.notification_status END,
      error_message = left(_error_message, 1000),
      failure_reason = left(_error_message, 1000),
      locked_until = CASE WHEN attempt_count >= 5 THEN NULL ELSE now() + make_interval(mins => least(60, power(2, attempt_count)::integer)) END
  WHERE id = _id AND status = 'processing';
$$;

REVOKE EXECUTE ON FUNCTION public.generate_due_notification_jobs(), public.claim_notification_jobs(integer), public.complete_notification_job(uuid, text), public.fail_notification_job(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_due_notification_jobs(), public.claim_notification_jobs(integer), public.complete_notification_job(uuid, text), public.fail_notification_job(uuid, text) TO service_role;
