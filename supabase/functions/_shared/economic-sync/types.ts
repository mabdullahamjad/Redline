export const FMP_PROVIDER = "financial_modeling_prep" as const;

export type ImpactLevel = "low" | "medium" | "high";
export type MarketAsset = "forex" | "bitcoin" | "ethereum" | "gold" | "silver" | "major_indices";

export interface FmpEconomicCalendarRecord {
  date?: unknown;
  country?: unknown;
  event?: unknown;
  currency?: unknown;
  impact?: unknown;
  actual?: unknown;
  previous?: unknown;
  estimate?: unknown;
  forecast?: unknown;
  unit?: unknown;
  [key: string]: unknown;
}

export interface NormalizedEconomicEvent {
  provider: typeof FMP_PROVIDER;
  providerEventId: string;
  title: string;
  country: string;
  currency: string;
  impact: ImpactLevel;
  actual: string | null;
  previous: string | null;
  forecast: string | null;
  eventTime: string;
  marketAssets: MarketAsset[];
  sourcePayload: FmpEconomicCalendarRecord;
}

export interface EconomicEventRow {
  provider_event_id: string;
  title: string;
  country: string | null;
  currency: string;
  impact: ImpactLevel;
  actual: string | null;
  previous: string | null;
  forecast: string | null;
  event_time: string;
  market_assets: MarketAsset[];
  source_payload: FmpEconomicCalendarRecord | null;
  is_expired: boolean;
  expired_at: string | null;
}

export interface SyncResult {
  fetched: number;
  normalized: number;
  inserted: number;
  updated: number;
  unchanged: number;
  skipped: number;
}

export interface StructuredLogger {
  info(event: string, fields?: Record<string, unknown>): void;
  warn(event: string, fields?: Record<string, unknown>): void;
  error(event: string, fields?: Record<string, unknown>): void;
}
