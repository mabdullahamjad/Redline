import { createClient } from "@supabase/supabase-js";
import { FmpEconomicCalendarClient } from "../_shared/economic-sync/fmp-client.ts";
import { logger } from "../_shared/economic-sync/logger.ts";
import { EconomicEventsRepository } from "../_shared/economic-sync/repository.ts";
import { syncEconomicEvents } from "../_shared/economic-sync/service.ts";

function environmentInteger(name: string, fallback: number): number {
  const value = Deno.env.get(name);
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 365)
    throw new Error(`${name} must be an integer between 0 and 365`);
  return parsed;
}

async function timingSafeEqual(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const syncSecret = Deno.env.get("ECONOMIC_SYNC_SECRET");
    const fmpApiKey = Deno.env.get("FMP_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!syncSecret || !fmpApiKey || !supabaseUrl || !serviceRoleKey) {
      throw new Error("Required synchronization secrets are not configured");
    }
    const presentedSecret = request.headers.get("x-economic-sync-secret") ?? "";
    if (!(await timingSafeEqual(presentedSecret, syncSecret))) {
      logger.warn("sync_unauthorized");
      return new Response("Unauthorized", { status: 401 });
    }

    const database = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const result = await syncEconomicEvents({
      client: new FmpEconomicCalendarClient({ apiKey: fmpApiKey }),
      repository: new EconomicEventsRepository(database),
      logger,
      lookbackDays: environmentInteger("FMP_SYNC_LOOKBACK_DAYS", 7),
      horizonDays: environmentInteger("FMP_SYNC_HORIZON_DAYS", 90),
    });
    return Response.json(result, { status: 200 });
  } catch (error) {
    logger.error("sync_failed", {
      message: error instanceof Error ? error.message : "unexpected error",
    });
    return Response.json({ error: "Economic event synchronization failed" }, { status: 502 });
  }
});
