-- State owned by the economic-calendar synchronization service. Historical
-- records are never deleted; they are marked expired after their event time.

ALTER TABLE public.economic_events
  ADD COLUMN is_expired boolean NOT NULL DEFAULT false,
  ADD COLUMN expired_at timestamptz;

ALTER TABLE public.economic_events
  ADD CONSTRAINT economic_events_expiration_consistent CHECK (
    (is_expired AND expired_at IS NOT NULL)
    OR (NOT is_expired AND expired_at IS NULL)
  );

-- The renamed legacy index already covers all event_time lookups.
DROP INDEX IF EXISTS public.economic_events_event_time_idx;

CREATE INDEX economic_events_upcoming_event_time_idx
  ON public.economic_events (event_time ASC)
  WHERE NOT is_expired;
