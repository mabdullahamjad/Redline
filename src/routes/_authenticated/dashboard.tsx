import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useDeferredValue, useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ImpactBadge } from "@/components/shared/ImpactBadge";
import { CurrencyPill } from "@/components/shared/CurrencyPill";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMySubscription } from "@/lib/subscriptions.functions";
import { getEconomicEvents, getMyNotificationLogs } from "@/lib/events.functions";
import {
  eventCountdown,
  eventStatus,
  type EconomicEvent,
  type EconomicEventFilters,
  type EconomicEventSort,
} from "@/lib/economic-events";
import {
  MARKET_CATEGORIES,
  MARKET_LABELS,
  assetsForMarket,
  type MarketCategory,
} from "@/lib/market-taxonomy";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const fetchSub = useServerFn(getMySubscription);
  const fetchEvents = useServerFn(getEconomicEvents);
  const fetchLogs = useServerFn(getMyNotificationLogs);

  const sub = useSuspenseQuery({ queryKey: ["subscription"], queryFn: () => fetchSub() });
  const [filters, setFilters] = useState<EconomicEventFilters>({ upcomingOnly: true });
  const [sort, setSort] = useState<EconomicEventSort>("event_time");
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const deferredFilters = useDeferredValue(filters);
  const deferredSort = useDeferredValue(sort);
  const events = useQuery({
    queryKey: ["economic-events", { filters: deferredFilters, sort: deferredSort, page, pageSize }],
    queryFn: () =>
      fetchEvents({ data: { filters: deferredFilters, sort: deferredSort, page, pageSize } }),
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
  });
  const logs = useQuery({ queryKey: ["my-logs"], queryFn: () => fetchLogs() });

  const marketPreferences = sub.data?.marketPreferences ?? [];
  const times = sub.data?.reminder_intervals_minutes ?? [];
  const configured = marketPreferences.length > 0 && times.length > 0;

  function updateFilters(next: Partial<EconomicEventFilters>) {
    setFilters((current) => ({ ...current, ...next }));
    setPage(0);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back${user.email ? `, ${user.email.split("@")[0]}` : ""}`}
        description="Your live view of upcoming events and delivery status."
      />

      {/* Stat strip */}
      <div className="flex flex-wrap gap-x-8 gap-y-4 border-y border-border py-4">
        <StatCard
          label="Markets"
          value={marketPreferences.length}
          icon={<Zap className="h-3 w-3" />}
          hint={
            marketPreferences
              .map((preference) => preference.assetCode ?? preference.market)
              .join(" · ") || "None selected"
          }
        />
        <StatCard
          label="Assets"
          value={marketPreferences.filter((preference) => preference.assetCode !== null).length}
          icon={<Bell className="h-3 w-3" />}
          hint="Market hierarchy"
        />
        <StatCard
          label="Lead times"
          value={times.length}
          icon={<Calendar className="h-3 w-3" />}
          hint={
            times.length
              ? times.map((t) => `${t >= 60 ? `${t / 60}h` : `${t}m`}`).join(" · ")
              : "None"
          }
        />
        <StatCard
          label="Status"
          value={configured ? "Active" : "Paused"}
          icon={<CheckCircle2 className="h-3 w-3" />}
          hint={configured ? "Ready to deliver alerts" : "Configure alerts in Settings"}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming events */}
        <SectionCard
          className="lg:col-span-2"
          title="Upcoming economic events"
          description="Events matching your filters will appear here."
        >
          <EventFilters
            filters={filters}
            sort={sort}
            onFiltersChange={updateFilters}
            onSortChange={(next) => {
              setSort(next);
              setPage(0);
            }}
          />
          {events.isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : events.isError ? (
            <EmptyState
              icon={<AlertCircle className="h-4 w-4" />}
              title="Economic events are unavailable"
              description="The calendar could not be loaded. Please try again."
              action={
                <Button size="sm" variant="outline" onClick={() => events.refetch()}>
                  <RefreshCw /> Retry
                </Button>
              }
            />
          ) : (events.data?.data.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Calendar className="h-4 w-4" />}
              title="No upcoming events yet"
              description="No live calendar events match the selected filters."
            />
          ) : (
            <EventTable events={events.data!.data} />
          )}
          {events.data && events.data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                {events.data.total} events · page {events.data.page + 1} of {events.data.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page + 1 >= events.data.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Subscription summary */}
        <SectionCard title="Your subscription" description="Delivery target and filters.">
          <dl className="space-y-4 p-4 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1 truncate font-medium text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Markets
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {marketPreferences.length ? (
                  marketPreferences.map((preference) => (
                    <span
                      key={`${preference.market}-${preference.assetCode ?? "all"}`}
                      className="border border-border px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {preference.assetCode ?? preference.market}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Reminder intervals
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {times.length ? (
                  times.map((time) => `${time >= 60 ? `${time / 60}h` : `${time}m`}`).join(" · ")
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <SectionCard title="Recent notifications" description="Last 20 alerts sent to your inbox.">
        {logs.isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (logs.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Bell className="h-4 w-4" />}
            title="No notifications yet"
            description="Notifications will land here as soon as the scheduler delivers your first alert."
          />
        ) : (
          <ul className="divide-y divide-border">
            {logs
              .data!.map((log) => ({
                ...log,
                sent_at: log.sent_at ?? log.last_attempt_at ?? log.created_at,
              }))
              .map((l) => (
                <li key={l.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.event?.title ?? "Event"}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {l.notification_type} · {new Date(l.sent_at).toLocaleString()}
                    </p>
                  </div>
                  {l.event?.currency && <CurrencyPill code={l.event.currency} variant="terminal" />}
                </li>
              ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function EventFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
}: {
  filters: EconomicEventFilters;
  sort: EconomicEventSort;
  onFiltersChange: (filters: Partial<EconomicEventFilters>) => void;
  onSortChange: (sort: EconomicEventSort) => void;
}) {
  return (
    <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 lg:grid-cols-3">
      <Input
        aria-label="Search economic events"
        className="h-8 font-mono text-xs"
        placeholder="Search events"
        value={filters.search ?? ""}
        onChange={(event) => onFiltersChange({ search: event.target.value || undefined })}
      />
      <select
        aria-label="Filter by market"
        className="h-8 border border-input bg-transparent px-2 font-mono text-xs text-foreground"
        value={filters.market ?? ""}
        onChange={(event) =>
          onFiltersChange({
            market: event.target.value ? (event.target.value as MarketCategory) : undefined,
            asset: undefined,
          })
        }
      >
        <option value="">All Markets</option>
        {MARKET_CATEGORIES.map((market) => (
          <option key={market} value={market}>
            {MARKET_LABELS[market]}
          </option>
        ))}
      </select>
      {filters.market && assetsForMarket(filters.market).length > 0 && (
        <select
          aria-label="Filter by asset"
          className="h-8 border border-input bg-transparent px-2 font-mono text-xs text-foreground"
          value={filters.asset ?? ""}
          onChange={(event) => onFiltersChange({ asset: event.target.value || undefined })}
        >
          <option value="">All {MARKET_LABELS[filters.market]}</option>
          {assetsForMarket(filters.market).map((asset) => (
            <option key={asset.code} value={asset.code}>
              {asset.label}
            </option>
          ))}
        </select>
      )}
      <select
        aria-label="Filter by impact"
        className="h-8 border border-input bg-transparent px-2 font-mono text-xs text-foreground"
        value={filters.impact ?? ""}
        onChange={(event) =>
          onFiltersChange({
            impact: event.target.value
              ? (event.target.value as EconomicEventFilters["impact"])
              : undefined,
          })
        }
      >
        <option value="">All impacts</option>
        <option value="high">High impact</option>
        <option value="medium">Medium impact</option>
        <option value="low">Low impact</option>
      </select>
      <select
        aria-label="Sort events"
        className="h-8 border border-input bg-transparent px-2 font-mono text-xs text-foreground"
        value={sort}
        onChange={(event) => onSortChange(event.target.value as EconomicEventSort)}
      >
        <option value="event_time">Sort: event time</option>
        <option value="impact">Sort: impact</option>
        <option value="country">Sort: country</option>
      </select>
      <label className="flex h-8 items-center gap-2 border border-input px-2 font-mono text-[10px] text-muted-foreground">
        <input
          type="checkbox"
          checked={filters.upcomingOnly}
          onChange={(event) => onFiltersChange({ upcomingOnly: event.target.checked })}
        />
        Upcoming only
      </label>
    </div>
  );
}

function EventTable({ events }: { events: EconomicEvent[] }) {
  const now = useCurrentTime();
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    timeZone: "UTC",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead>Forecast</TableHead>
            <TableHead>Previous</TableHead>
            <TableHead>Actual</TableHead>
            <TableHead>Date (UTC)</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const status = eventStatus(event, now);
            return (
              <TableRow key={event.id}>
                <TableCell className="min-w-44 font-medium">{event.title}</TableCell>
                <TableCell>{event.country ?? "—"}</TableCell>
                <TableCell>
                  <CurrencyPill code={event.currency} variant="terminal" />
                </TableCell>
                <TableCell>
                  <ImpactBadge impact={event.impact} variant="terminal" />
                </TableCell>
                <TableCell>{event.forecast ?? "—"}</TableCell>
                <TableCell>{event.previous ?? "—"}</TableCell>
                <TableCell>{event.actual ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(event.event_time))}
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {timeFormatter.format(new Date(event.event_time))}
                </TableCell>
                <TableCell className="text-right font-mono text-[10px] uppercase text-muted-foreground">
                  {status === "upcoming" ? eventCountdown(event, now) : status}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function useCurrentTime() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
}
