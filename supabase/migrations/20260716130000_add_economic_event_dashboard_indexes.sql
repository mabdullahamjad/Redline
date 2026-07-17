-- Supports dashboard filters and secondary sort orders without changing the
-- data model. The calendar is read far more often than it is synchronized.

CREATE INDEX economic_events_impact_event_time_idx
  ON public.economic_events (impact DESC, event_time ASC);

CREATE INDEX economic_events_country_event_time_idx
  ON public.economic_events (country ASC, event_time ASC);

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE INDEX economic_events_title_trgm_idx
  ON public.economic_events
  USING gin (title extensions.gin_trgm_ops);

CREATE INDEX economic_events_country_trgm_idx
  ON public.economic_events
  USING gin (country extensions.gin_trgm_ops);
