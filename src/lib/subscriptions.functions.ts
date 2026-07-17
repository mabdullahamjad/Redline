import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MARKET_CATEGORIES, MARKET_ASSETS } from "@/lib/market-taxonomy";

const MarketPreferenceSchema = z
  .object({
    market: z.enum(MARKET_CATEGORIES),
    assetCode: z.string().trim().max(64).nullable(),
  })
  .superRefine((value, context) => {
    if (value.assetCode === null) return;
    const allowed = MARKET_ASSETS[value.market].map((asset) => asset.code);
    if (value.market !== "indices" && !allowed.includes(value.assetCode)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unsupported asset for ${value.market}`,
      });
    }
  });

const NotificationPreferencesInputSchema = z
  .object({
    marketPreferences: z
      .array(MarketPreferenceSchema)
      .min(1, "Select at least one market preference"),
    reminderIntervalsMinutes: z
      .array(z.union([z.literal(15), z.literal(60), z.literal(720), z.literal(1440)]))
      .min(1, "Select at least one reminder interval"),
  })
  .superRefine((value, context) => {
    const preferenceKeys = value.marketPreferences.map(
      (preference) => `${preference.market}:${preference.assetCode ?? "all"}`,
    );
    if (new Set(preferenceKeys).size !== preferenceKeys.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate market preferences are not allowed",
      });
    }
    if (new Set(value.reminderIntervalsMinutes).size !== value.reminderIntervalsMinutes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate reminder intervals are not allowed",
      });
    }
  });

export type NotificationPreferencesInput = z.infer<typeof NotificationPreferencesInputSchema>;

export const getMySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: subscription, error } = await context.supabase
      .from("subscriptions")
      .select("id,is_active,reminder_intervals_minutes,timezone")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(`Could not load notification preferences: ${error.message}`);
    if (!subscription) return null;

    const { data: marketPreferences, error: preferencesError } = await context.supabase
      .from("subscription_market_preferences")
      .select("market,asset_code")
      .eq("subscription_id", subscription.id)
      .order("market", { ascending: true });
    if (preferencesError)
      throw new Error(`Could not load market preferences: ${preferencesError.message}`);

    return {
      ...subscription,
      marketPreferences: (marketPreferences ?? []).map((preference) => ({
        market: preference.market,
        assetCode: preference.asset_code,
      })),
    };
  });

export const upsertMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => NotificationPreferencesInputSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("update_notification_preferences", {
      _reminder_intervals: data.reminderIntervalsMinutes,
      _market_preferences: data.marketPreferences.map((preference) => ({
        market: preference.market,
        asset_code: preference.assetCode,
      })),
    });
    if (error) throw new Error(`Could not save notification preferences: ${error.message}`);
    return { saved: true };
  });
