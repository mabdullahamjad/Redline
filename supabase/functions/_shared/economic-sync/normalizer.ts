import {
  FMP_PROVIDER,
  type FmpEconomicCalendarRecord,
  type ImpactLevel,
  type MarketAsset,
  type NormalizedEconomicEvent,
} from "./types.ts";

export class EventNormalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventNormalizationError";
  }
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new EventNormalizationError(`${field} is required`);
  return value.trim();
}

function optionalText(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value).trim() || null;
  return null;
}

function normalizeImpact(value: unknown): ImpactLevel {
  const impact = requiredText(value, "impact").toLowerCase();
  if (impact === "low") return "low";
  if (impact === "medium" || impact === "med") return "medium";
  if (impact === "high") return "high";
  throw new EventNormalizationError(`unsupported impact: ${impact}`);
}

function parseFmpUtc(value: unknown): string {
  const raw = requiredText(value, "date");
  const withTimeZone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(raw) ? raw : `${raw.replace(" ", "T")}Z`;
  const timestamp = Date.parse(withTimeZone);
  if (Number.isNaN(timestamp)) throw new EventNormalizationError(`invalid date: ${raw}`);
  return new Date(timestamp).toISOString();
}

function canonicalSourcePart(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function classifyMarkets(title: string): MarketAsset[] {
  const normalized = title.toLowerCase();
  const markets = new Set<MarketAsset>(["forex"]);
  if (/\b(bitcoin|btc)\b/.test(normalized)) markets.add("bitcoin");
  if (/\b(ethereum|eth)\b/.test(normalized)) markets.add("ethereum");
  if (/\bgold\b/.test(normalized)) markets.add("gold");
  if (/\bsilver\b/.test(normalized)) markets.add("silver");
  if (/\b(index|indices|nasdaq|s&p|dow)\b/.test(normalized)) markets.add("major_indices");
  return [...markets];
}

export async function normalizeEconomicEvent(
  raw: FmpEconomicCalendarRecord,
): Promise<NormalizedEconomicEvent> {
  const title = requiredText(raw.event, "event");
  const country = requiredText(raw.country, "country");
  const currency = requiredText(raw.currency, "currency").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency))
    throw new EventNormalizationError("currency must be a three-letter ISO code");

  const eventTime = parseFmpUtc(raw.date);
  const providerEventId = await sha256(
    [
      FMP_PROVIDER,
      canonicalSourcePart(title),
      canonicalSourcePart(country),
      currency,
      eventTime,
    ].join("|"),
  );

  return {
    provider: FMP_PROVIDER,
    providerEventId,
    title,
    country,
    currency,
    impact: normalizeImpact(raw.impact),
    actual: optionalText(raw.actual),
    previous: optionalText(raw.previous),
    forecast: optionalText(raw.estimate ?? raw.forecast),
    eventTime,
    marketAssets: classifyMarkets(title),
    sourcePayload: raw,
  };
}
