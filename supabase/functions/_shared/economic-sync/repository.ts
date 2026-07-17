import type { EconomicEventRow, NormalizedEconomicEvent } from "./types.ts";

const CHUNK_SIZE = 200;

type QueryResult<T> = PromiseLike<{ data: T | null; error: { message: string } | null }>;

export interface EconomicEventsDatabase {
  from(table: "economic_events"): {
    select(columns: string): {
      eq(
        column: string,
        value: string,
      ): {
        in(column: string, values: string[]): QueryResult<EconomicEventRow[]>;
      };
    };
    upsert(rows: DatabaseEventRow[], options: { onConflict: string }): QueryResult<unknown>;
    update(values: Record<string, unknown>): {
      eq(
        column: string,
        value: boolean,
      ): {
        lt(column: string, value: string): QueryResult<unknown>;
      };
    };
  };
}

interface DatabaseEventRow {
  provider: string;
  provider_event_id: string;
  title: string;
  country: string;
  currency: string;
  impact: string;
  actual: string | null;
  previous: string | null;
  forecast: string | null;
  event_time: string;
  market_assets: string[];
  source_payload: Record<string, unknown>;
  is_expired: boolean;
  expired_at: string | null;
}

function chunks<T>(values: T[]): T[][] {
  return Array.from({ length: Math.ceil(values.length / CHUNK_SIZE) }, (_, index) =>
    values.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
  );
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function toRow(
  event: NormalizedEconomicEvent,
  now: string,
  existing?: EconomicEventRow,
): DatabaseEventRow {
  const isExpired = Date.parse(event.eventTime) < Date.parse(now);
  return {
    provider: event.provider,
    provider_event_id: event.providerEventId,
    title: event.title,
    country: event.country,
    currency: event.currency,
    impact: event.impact,
    actual: event.actual,
    previous: event.previous,
    forecast: event.forecast,
    event_time: event.eventTime,
    market_assets: event.marketAssets,
    source_payload: event.sourcePayload,
    is_expired: isExpired,
    expired_at: isExpired ? (existing?.expired_at ?? now) : null,
  };
}

function isUnchanged(row: DatabaseEventRow, existing: EconomicEventRow): boolean {
  return (
    row.title === existing.title &&
    row.country === existing.country &&
    row.currency === existing.currency &&
    row.impact === existing.impact &&
    row.actual === existing.actual &&
    row.previous === existing.previous &&
    row.forecast === existing.forecast &&
    row.event_time === existing.event_time &&
    stableJson(row.market_assets) === stableJson(existing.market_assets) &&
    stableJson(row.source_payload) === stableJson(existing.source_payload) &&
    row.is_expired === existing.is_expired &&
    row.expired_at === existing.expired_at
  );
}

export class EconomicEventsRepository {
  constructor(private readonly database: EconomicEventsDatabase) {}

  async upsertChanged(events: NormalizedEconomicEvent[], now = new Date().toISOString()) {
    const byId = new Map(events.map((event) => [event.providerEventId, event]));
    const existingById = new Map<string, EconomicEventRow>();

    for (const ids of chunks([...byId.keys()])) {
      const { data, error } = await this.database
        .from("economic_events")
        .select(
          "provider_event_id,title,country,currency,impact,actual,previous,forecast,event_time,market_assets,source_payload,is_expired,expired_at",
        )
        .eq("provider", "financial_modeling_prep")
        .in("provider_event_id", ids);
      if (error) throw new Error(`Could not read existing economic events: ${error.message}`);
      for (const row of data ?? []) existingById.set(row.provider_event_id, row);
    }

    const changed: DatabaseEventRow[] = [];
    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    for (const event of byId.values()) {
      const existing = existingById.get(event.providerEventId);
      const row = toRow(event, now, existing);
      if (!existing) {
        inserted += 1;
        changed.push(row);
      } else if (isUnchanged(row, existing)) {
        unchanged += 1;
      } else {
        updated += 1;
        changed.push(row);
      }
    }

    for (const batch of chunks(changed)) {
      const { error } = await this.database
        .from("economic_events")
        .upsert(batch, { onConflict: "provider,provider_event_id" });
      if (error) throw new Error(`Could not upsert economic events: ${error.message}`);
    }
    return { inserted, updated, unchanged };
  }

  async markPastEventsExpired(now = new Date().toISOString()): Promise<void> {
    const { error } = await this.database
      .from("economic_events")
      .update({ is_expired: true, expired_at: now })
      .eq("is_expired", false)
      .lt("event_time", now);
    if (error) throw new Error(`Could not expire past economic events: ${error.message}`);
  }
}
