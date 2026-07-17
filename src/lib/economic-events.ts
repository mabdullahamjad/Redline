import type { Tables } from "@/integrations/supabase/types";
import type { MarketCategory } from "@/lib/market-taxonomy";

export type EconomicEvent = Pick<
  Tables<"events">,
  | "id"
  | "title"
  | "country"
  | "currency"
  | "impact"
  | "forecast"
  | "previous"
  | "actual"
  | "event_time"
>;

export type EconomicEventSort = "event_time" | "impact" | "country";

export interface EconomicEventFilters {
  market?: MarketCategory;
  asset?: string;
  impact?: "low" | "medium" | "high";
  search?: string;
  upcomingOnly: boolean;
}

export interface EconomicEventPage {
  data: EconomicEvent[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function eventStatus(event: EconomicEvent, now: number): "upcoming" | "live" | "completed" {
  const eventTime = Date.parse(event.event_time);
  if (eventTime > now) return "upcoming";
  if (event.actual === null && now < eventTime + 15 * 60 * 1_000) return "live";
  return "completed";
}

export function eventCountdown(event: EconomicEvent, now: number): string {
  const milliseconds = Date.parse(event.event_time) - now;
  if (milliseconds <= 0) return eventStatus(event, now) === "live" ? "LIVE" : "COMPLETE";

  const seconds = Math.floor(milliseconds / 1_000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainingSeconds = seconds % 60;
  const clock = [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  return days > 0 ? `${days}d ${clock}` : clock;
}
