import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MARKET_ASSETS,
  MARKET_CATEGORIES,
  MARKET_LABELS,
  type MarketCategory,
} from "@/lib/market-taxonomy";
import {
  getMySubscription,
  upsertMySubscription,
  type NotificationPreferencesInput,
} from "@/lib/subscriptions.functions";

const REMINDERS = [
  { value: 1440, label: "24 Hours Before" },
  { value: 720, label: "12 Hours Before" },
  { value: 60, label: "1 Hour Before" },
  { value: 15, label: "15 Minutes Before" },
] as const;

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

function SettingsPage() {
  const fetchPreferences = useServerFn(getMySubscription);
  const savePreferences = useServerFn(upsertMySubscription);
  const queryClient = useQueryClient();
  const preferences = useSuspenseQuery({
    queryKey: ["subscription"],
    queryFn: () => fetchPreferences(),
  });
  const [marketPreferences, setMarketPreferences] = useState<
    NotificationPreferencesInput["marketPreferences"]
  >([]);
  const [intervals, setIntervals] = useState<
    NotificationPreferencesInput["reminderIntervalsMinutes"]
  >([]);

  useEffect(() => {
    setMarketPreferences(preferences.data?.marketPreferences ?? []);
    setIntervals(
      (preferences.data?.reminder_intervals_minutes ??
        []) as NotificationPreferencesInput["reminderIntervalsMinutes"],
    );
  }, [preferences.data]);

  const save = useMutation({
    mutationFn: (data: NotificationPreferencesInput) => savePreferences({ data }),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["subscription"] });
      const previous = queryClient.getQueryData<typeof preferences.data>(["subscription"]);
      queryClient.setQueryData(
        ["subscription"],
        (current: typeof preferences.data) =>
          current && {
            ...current,
            marketPreferences: next.marketPreferences,
            reminder_intervals_minutes: next.reminderIntervalsMinutes,
          },
      );
      return { previous };
    },
    onError: (error, _next, context) => {
      queryClient.setQueryData(["subscription"], context?.previous);
      toast.error(
        error instanceof Error ? error.message : "Could not save preferences. Retry when ready.",
      );
    },
    onSuccess: () => toast.success("Notification preferences saved"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["subscription"] }),
  });

  function togglePreference(market: MarketCategory, assetCode: string | null) {
    setMarketPreferences((current) => {
      const exists = current.some((item) => item.market === market && item.assetCode === assetCode);
      return exists
        ? current.filter((item) => item.market !== market || item.assetCode !== assetCode)
        : [...current, { market, assetCode }];
    });
  }
  function toggleInterval(value: NotificationPreferencesInput["reminderIntervalsMinutes"][number]) {
    setIntervals((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }
  function active(market: MarketCategory, assetCode: string | null) {
    return marketPreferences.some((item) => item.market === market && item.assetCode === assetCode);
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Notification preferences"
        description="Choose the markets and lead times future REDLINE alerts will use."
      />
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Markets</h2>
        <p className="text-xs text-muted-foreground">
          Subscribe to a whole market or selected assets within it.
        </p>
        <div className="space-y-3">
          {MARKET_CATEGORIES.map((market) => (
            <div key={market} className="border border-border p-3">
              <button
                type="button"
                onClick={() => togglePreference(market, null)}
                className={cn(
                  "border px-3 py-1.5 font-mono text-xs",
                  active(market, null)
                    ? "border-foreground bg-surface-active text-foreground"
                    : "border-border text-muted-foreground",
                )}
              >{`All ${MARKET_LABELS[market]}`}</button>
              {MARKET_ASSETS[market].length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {MARKET_ASSETS[market].map((asset) => (
                    <button
                      type="button"
                      key={asset.code}
                      onClick={() => togglePreference(market, asset.code)}
                      className={cn(
                        "border px-3 py-1.5 font-mono text-xs",
                        active(market, asset.code)
                          ? "border-foreground bg-surface-active text-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-1 inline h-3 w-3",
                          active(market, asset.code) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {asset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3 border-t border-border pt-8">
        <h2 className="text-sm font-medium text-foreground">Reminder intervals</h2>
        <div className="flex flex-wrap gap-2">
          {REMINDERS.map((reminder) => (
            <button
              type="button"
              key={reminder.value}
              onClick={() => toggleInterval(reminder.value)}
              className={cn(
                "border px-4 py-2 font-mono text-xs",
                intervals.includes(reminder.value)
                  ? "border-foreground bg-surface-active text-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {reminder.label}
            </button>
          ))}
        </div>
      </section>
      <div className="flex justify-end border-t border-border pt-6">
        <Button
          onClick={() => save.mutate({ marketPreferences, reminderIntervalsMinutes: intervals })}
          disabled={save.isPending}
        >
          {save.isPending ? (
            <Loader2 className="mr-1.5 animate-spin" />
          ) : (
            <Save className="mr-1.5" />
          )}
          Save preferences
        </Button>
      </div>
    </div>
  );
}
