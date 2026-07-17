CREATE TYPE public.market_category AS ENUM ('forex', 'crypto', 'metals', 'indices');

CREATE TABLE public.subscription_market_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  market public.market_category NOT NULL,
  asset_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscription_market_preferences_asset_valid CHECK (
    (market = 'forex' AND (asset_code IS NULL OR asset_code IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'CNY')))
    OR (market = 'crypto' AND (asset_code IS NULL OR asset_code IN ('BTC', 'ETH')))
    OR (market = 'metals' AND (asset_code IS NULL OR asset_code IN ('XAU', 'XAG')))
    OR (market = 'indices' AND (asset_code IS NULL OR asset_code ~ '^[A-Z0-9 .&-]{1,64}$'))
  )
);

CREATE UNIQUE INDEX subscription_market_preferences_unique_idx
  ON public.subscription_market_preferences (subscription_id, market, coalesce(asset_code, ''));
CREATE INDEX subscription_market_preferences_subscription_idx
  ON public.subscription_market_preferences (subscription_id);

INSERT INTO public.subscription_market_preferences (subscription_id, market, asset_code)
SELECT subscriptions.id,
  CASE legacy_market
    WHEN 'forex' THEN 'forex'::public.market_category
    WHEN 'bitcoin' THEN 'crypto'::public.market_category
    WHEN 'ethereum' THEN 'crypto'::public.market_category
    WHEN 'gold' THEN 'metals'::public.market_category
    WHEN 'silver' THEN 'metals'::public.market_category
    WHEN 'major_indices' THEN 'indices'::public.market_category
  END,
  CASE legacy_market
    WHEN 'bitcoin' THEN 'BTC'
    WHEN 'ethereum' THEN 'ETH'
    WHEN 'gold' THEN 'XAU'
    WHEN 'silver' THEN 'XAG'
    ELSE NULL
  END
FROM public.subscriptions
CROSS JOIN unnest(target_markets) AS legacy_market
ON CONFLICT DO NOTHING;

ALTER TABLE public.subscription_market_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own market preferences"
  ON public.subscription_market_preferences FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.subscriptions WHERE id = subscription_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.subscriptions WHERE id = subscription_id AND user_id = auth.uid()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_market_preferences TO authenticated;
GRANT ALL ON public.subscription_market_preferences TO service_role;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_reminder_intervals_not_empty,
  DROP CONSTRAINT subscriptions_reminder_intervals_positive,
  ALTER COLUMN reminder_intervals_minutes SET DEFAULT ARRAY[]::smallint[];

CREATE OR REPLACE FUNCTION public.has_supported_distinct_reminder_intervals(input_values smallint[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT input_values <@ ARRAY[15, 60, 720, 1440]::smallint[]
     AND cardinality(input_values) = cardinality(ARRAY(SELECT DISTINCT value FROM unnest(input_values) AS value));
$$;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_reminder_intervals_supported CHECK (
    public.has_supported_distinct_reminder_intervals(reminder_intervals_minutes)
  );

DROP INDEX IF EXISTS public.subscriptions_target_markets_gin_idx;
ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_target_markets_not_empty,
  DROP COLUMN target_markets,
  DROP COLUMN currencies,
  DROP COLUMN impact_levels,
  DROP COLUMN notification_times,
  DROP COLUMN email;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
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
  IF jsonb_typeof(_market_preferences) <> 'array' THEN RAISE EXCEPTION 'market preferences must be an array'; END IF;

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

REVOKE EXECUTE ON FUNCTION public.update_notification_preferences(smallint[], jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_notification_preferences(smallint[], jsonb) TO authenticated, service_role;
