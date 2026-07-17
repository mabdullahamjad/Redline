-- A small, RLS-respecting lookup for the dashboard country selector. Returning
-- distinct values in SQL avoids transferring and de-duplicating calendar rows
-- in the browser.
CREATE OR REPLACE FUNCTION public.list_economic_event_countries()
RETURNS TABLE(country text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT DISTINCT event.country
  FROM public.economic_events AS event
  WHERE event.country IS NOT NULL
    AND btrim(event.country) <> ''
  ORDER BY event.country;
$$;

REVOKE EXECUTE ON FUNCTION public.list_economic_event_countries() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_economic_event_countries() TO authenticated, service_role;
