import { FmpEconomicCalendarClient } from "./fmp-client.ts";
import { EventNormalizationError, normalizeEconomicEvent } from "./normalizer.ts";
import { EconomicEventsRepository } from "./repository.ts";
import type { StructuredLogger, SyncResult } from "./types.ts";

export interface SyncEconomicEventsOptions {
  client: FmpEconomicCalendarClient;
  repository: EconomicEventsRepository;
  logger: StructuredLogger;
  now?: Date;
  lookbackDays: number;
  horizonDays: number;
}

export async function syncEconomicEvents(options: SyncEconomicEventsOptions): Promise<SyncResult> {
  const now = options.now ?? new Date();
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - options.lookbackDays);
  const to = new Date(now);
  to.setUTCDate(to.getUTCDate() + options.horizonDays);

  options.logger.info("sync_started", { from: from.toISOString(), to: to.toISOString() });
  const rawEvents = await options.client.fetchCalendar(from, to);
  options.logger.info("events_fetched", { count: rawEvents.length });

  const normalized = [];
  let skipped = 0;
  for (const rawEvent of rawEvents) {
    try {
      normalized.push(await normalizeEconomicEvent(rawEvent));
    } catch (error) {
      skipped += 1;
      options.logger.warn("event_skipped", {
        reason: error instanceof EventNormalizationError ? error.message : "normalization failed",
      });
    }
  }

  const deduplicated = [
    ...new Map(normalized.map((event) => [event.providerEventId, event])).values(),
  ];
  const counts = await options.repository.upsertChanged(deduplicated, now.toISOString());
  await options.repository.markPastEventsExpired(now.toISOString());

  const result: SyncResult = {
    fetched: rawEvents.length,
    normalized: deduplicated.length,
    skipped,
    ...counts,
  };
  options.logger.info("sync_completed", result);
  return result;
}
