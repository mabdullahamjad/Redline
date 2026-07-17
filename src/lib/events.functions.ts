import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  EconomicEventFilters,
  EconomicEventPage,
  EconomicEventSort,
} from "@/lib/economic-events";
import { MARKET_CATEGORIES, assetsForMarket } from "@/lib/market-taxonomy";

const EconomicEventQuerySchema = z.object({
  page: z.number().int().min(0).max(10_000).default(0),
  pageSize: z.number().int().min(1).max(50).default(10),
  sort: z.enum(["event_time", "impact", "country"]).default("event_time"),
  filters: z
    .object({
      market: z.enum(MARKET_CATEGORIES).optional(),
      asset: z.string().trim().max(64).optional(),
      impact: z.enum(["low", "medium", "high"]).optional(),
      search: z.string().trim().max(120).optional(),
      upcomingOnly: z.boolean().default(true),
    })
    .default({ upcomingOnly: true }),
});

function escapeIlike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export const getEconomicEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => EconomicEventQuerySchema.parse(data))
  .handler(async ({ context, data }): Promise<EconomicEventPage> => {
    const filters: EconomicEventFilters = {
      ...data.filters,
    };
    const from = data.page * data.pageSize;
    const to = from + data.pageSize - 1;
    let query = context.supabase
      .from("events")
      .select("id,title,country,currency,impact,forecast,previous,actual,event_time", {
        count: "exact",
      });

    if (filters.upcomingOnly) query = query.gte("event_time", new Date().toISOString());
    if (filters.market) {
      const asset = filters.asset;
      const validAssets = assetsForMarket(filters.market).map((item) => item.code);
      if (asset && !validAssets.includes(asset)) throw new Error("Unsupported market asset");
      if (filters.market === "forex") {
        query = query.contains("market_assets", ["forex"]);
        if (asset) query = query.eq("currency", asset);
      } else if (filters.market === "crypto") {
        query =
          asset === "BTC"
            ? query.contains("market_assets", ["bitcoin"])
            : asset === "ETH"
              ? query.contains("market_assets", ["ethereum"])
              : query.overlaps("market_assets", ["bitcoin", "ethereum"]);
      } else if (filters.market === "metals") {
        query =
          asset === "XAU"
            ? query.contains("market_assets", ["gold"])
            : asset === "XAG"
              ? query.contains("market_assets", ["silver"])
              : query.overlaps("market_assets", ["gold", "silver"]);
      } else {
        query = query.contains("market_assets", ["major_indices"]);
      }
    }
    if (filters.impact) query = query.eq("impact", filters.impact);
    if (filters.search) query = query.ilike("title", `%${escapeIlike(filters.search)}%`);

    const sort: EconomicEventSort = data.sort;
    if (sort === "impact")
      query = query.order("impact", { ascending: false }).order("event_time", { ascending: true });
    else if (sort === "country")
      query = query.order("country", { ascending: true }).order("event_time", { ascending: true });
    else query = query.order("event_time", { ascending: true });

    const { data: rows, error, count } = await query.range(from, to);
    if (error) throw new Error(`Could not load economic events: ${error.message}`);
    const total = count ?? 0;
    return {
      data: rows ?? [],
      page: data.page,
      pageSize: data.pageSize,
      total,
      totalPages: Math.ceil(total / data.pageSize),
    };
  });

export const getUpcomingEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("event_time", nowIso)
      .order("event_time", { ascending: true })
      .limit(25);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyNotificationLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: logs, error } = await supabase
      .from("notification_logs")
      .select("id,event_id,notification_type,status,sent_at,last_attempt_at,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    const eventIds = [...new Set((logs ?? []).map((log) => log.event_id))];
    if (!eventIds.length) return [];
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id,title,currency")
      .in("id", eventIds);
    if (eventsError) throw new Error(eventsError.message);
    const eventsById = new Map((events ?? []).map((event) => [event.id, event]));
    return (logs ?? []).map((log) => ({ ...log, event: eventsById.get(log.event_id) ?? null }));
  });
