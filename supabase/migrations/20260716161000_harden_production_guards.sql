-- Production guardrails: client validation is helpful UX, but the database is
-- the authoritative boundary for preferences and notification recipients.

CREATE OR REPLACE FUNCTION public.has_supported_distinct_reminder_intervals(input_values smallint[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT input_values IS NOT NULL
     AND cardinality(input_values) > 0
     AND input_values <@ ARRAY[15, 60, 720, 1440]::smallint[]
     AND cardinality(input_values) = cardinality(ARRAY(SELECT DISTINCT value FROM unnest(input_values) AS value));
$$;

CREATE OR REPLACE FUNCTION public.update_notification_preferences(
  _reminder_intervals smallint[],
  _market_preferences jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _subscription_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF NOT public.has_supported_distinct_reminder_intervals(_reminder_intervals) THEN
    RAISE EXCEPTION 'reminder intervals must be distinct supported values';
  END IF;
  IF jsonb_typeof(_market_preferences) <> 'array' OR jsonb_array_length(_market_preferences) = 0 THEN
    RAISE EXCEPTION 'at least one market preference is required';
  END IF;

  SELECT id INTO _subscription_id FROM public.subscriptions WHERE user_id = auth.uid();
  IF _subscription_id IS NULL THEN RAISE EXCEPTION 'subscription not found'; END IF;

  UPDATE public.subscriptions
  SET reminder_intervals_minutes = _reminder_intervals
  WHERE id = _subscription_id;

  DELETE FROM public.subscription_market_preferences WHERE subscription_id = _subscription_id;
  INSERT INTO public.subscription_market_preferences (subscription_id, market, asset_code)
  SELECT _subscription_id, item.market, NULLIF(btrim(item.asset_code), '')
  FROM jsonb_to_recordset(_market_preferences) AS item(market public.market_category, asset_code text);
END;
$$;

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
  SELECT DISTINCT subscriptions.user_id, subscriptions.id, events.id, 'email', reminder.interval_minutes,
    'pending'::public.notification_status, users.email
  FROM public.economic_events AS events
  JOIN public.subscriptions AS subscriptions ON subscriptions.is_active
  JOIN public.subscription_market_preferences AS preference ON preference.subscription_id = subscriptions.id
  JOIN auth.users AS users ON users.id = subscriptions.user_id
  CROSS JOIN LATERAL unnest(subscriptions.reminder_intervals_minutes) AS reminder(interval_minutes)
  WHERE users.email IS NOT NULL
    AND btrim(users.email) <> ''
    AND events.event_time > now()
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
