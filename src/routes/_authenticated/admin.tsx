import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, AlertCircle, Bell, Calendar, ShieldCheck, Users } from "lucide-react";
import { CurrencyPill } from "@/components/shared/CurrencyPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { ImpactBadge } from "@/components/shared/ImpactBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminCheck,
  adminListEvents,
  adminListLogs,
  adminListUsers,
  adminSystemStatus,
} from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPage });

function AdminPage() {
  const check = useServerFn(adminCheck);
  const admin = useSuspenseQuery({ queryKey: ["admin-check"], queryFn: () => check() });
  return admin.data.isAdmin ? <AdminDashboard /> : <NotAdmin />;
}

function NotAdmin() {
  return (
    <div className="mx-auto max-w-md py-24">
      <EmptyState
        icon={<AlertCircle className="h-4 w-4" />}
        title="Admins only"
        description="You need admin privileges to view this page. Contact the workspace owner if you think this is a mistake."
      />
    </div>
  );
}

function AdminDashboard() {
  const status = useServerFn(adminSystemStatus);
  const events = useServerFn(adminListEvents);
  const users = useServerFn(adminListUsers);
  const logs = useServerFn(adminListLogs);
  const statusQ = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => status(),
    refetchInterval: 30_000,
  });
  const eventsQ = useQuery({ queryKey: ["admin-events"], queryFn: () => events() });
  const usersQ = useQuery({ queryKey: ["admin-users"], queryFn: () => users() });
  const logsQ = useQuery({
    queryKey: ["admin-logs"],
    queryFn: () => logs(),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Control center"
        description="Operational status, events, users, and delivery logs."
      />
      <div className="grid gap-px border border-border bg-border md:grid-cols-4">
        {statusQ.data ? (
          [statusQ.data.api, statusQ.data.email, statusQ.data.scheduler].map((item) => (
            <SystemStatusTile key={item.name} {...item} />
          ))
        ) : (
          <>
            <Skeleton className="h-28 w-full rounded-none bg-card" />
            <Skeleton className="h-28 w-full rounded-none bg-card" />
            <Skeleton className="h-28 w-full rounded-none bg-card" />
          </>
        )}
        <div className="flex flex-col justify-center gap-1 bg-card p-4">
          <StatCard
            layout="row"
            label="Users"
            value={statusQ.data?.users ?? "—"}
            icon={<Users className="h-3 w-3" />}
          />
          <StatCard
            layout="row"
            label="Events tracked"
            value={statusQ.data?.events ?? "—"}
            icon={<Calendar className="h-3 w-3" />}
          />
          <StatCard
            layout="row"
            label="Subscriptions"
            value={statusQ.data?.subscriptions ?? "—"}
            icon={<ShieldCheck className="h-3 w-3" />}
          />
          <StatCard
            layout="row"
            label="Notifications sent"
            value={statusQ.data?.notifications ?? "—"}
            icon={<Bell className="h-3 w-3" />}
          />
        </div>
      </div>
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <OperationalMetric label="Pending" value={statusQ.data?.metrics.pending} />
        <OperationalMetric label="Processing" value={statusQ.data?.metrics.processing} />
        <OperationalMetric label="Sent" value={statusQ.data?.metrics.sent} />
        <OperationalMetric label="Failed" value={statusQ.data?.metrics.failed} />
      </div>
      {statusQ.data && (
        <p className="font-mono text-xs text-muted-foreground">
          Last FMP sync: {formatTimestamp(statusQ.data.lastSyncAt)} / Last notification run:{" "}
          {formatTimestamp(statusQ.data.lastNotificationRun)}
        </p>
      )}
      <SectionCard title="Event management" description="Latest events in the calendar.">
        <EventsContent loading={eventsQ.isLoading} data={eventsQ.data ?? []} />
      </SectionCard>
      <div className="grid gap-8 lg:grid-cols-2">
        <SectionCard title="Users" description="Registered accounts.">
          <UsersContent loading={usersQ.isLoading} data={usersQ.data ?? []} />
        </SectionCard>
        <SectionCard title="Notification logs" description="Recent delivery activity.">
          <LogsContent loading={logsQ.isLoading} data={logsQ.data ?? []} />
        </SectionCard>
      </div>
    </div>
  );
}

function EventsContent({
  loading,
  data,
}: {
  loading: boolean;
  data: Awaited<ReturnType<typeof adminListEvents>>;
}) {
  if (loading)
    return (
      <div className="p-4">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (!data.length)
    return (
      <EmptyState
        icon={<Calendar className="h-4 w-4" />}
        title="No events yet"
        description="Events will appear here once the FMP integration is connected."
      />
    );
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead className="text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>
                <CurrencyPill code={event.currency} variant="terminal" />
              </TableCell>
              <TableCell>
                <ImpactBadge impact={event.impact} variant="terminal" />
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {new Date(event.event_time).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UsersContent({
  loading,
  data,
}: {
  loading: boolean;
  data: Awaited<ReturnType<typeof adminListUsers>>;
}) {
  if (loading)
    return (
      <div className="p-4">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (!data.length) return <EmptyState icon={<Users className="h-4 w-4" />} title="No users yet" />;
  return (
    <ul className="divide-y divide-border">
      {data.map((user) => (
        <li key={user.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="truncate">{user.email ?? user.id}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
}

function LogsContent({
  loading,
  data,
}: {
  loading: boolean;
  data: Awaited<ReturnType<typeof adminListLogs>>;
}) {
  if (loading)
    return (
      <div className="p-4">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (!data.length)
    return <EmptyState icon={<Bell className="h-4 w-4" />} title="No deliveries yet" />;
  return (
    <ul className="divide-y divide-border">
      {data.map((log) => (
        <li key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{log.event?.title ?? "Event"}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {log.recipient_email ?? "Unknown recipient"} / {log.status} /{" "}
              {formatTimestamp(log.sent_at ?? log.last_attempt_at ?? log.created_at)}
            </p>
          </div>
          {log.event?.currency && <CurrencyPill code={log.event.currency} variant="terminal" />}
        </li>
      ))}
    </ul>
  );
}

function OperationalMetric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value ?? "—"}</p>
    </div>
  );
}
function formatTimestamp(timestamp: string | null): string {
  return timestamp ? new Date(timestamp).toLocaleString() : "No recorded activity";
}

const STATUS_MAP = {
  healthy: { text: "Healthy", dot: "bg-success", bar: "bg-success", width: "w-full" },
  degraded: { text: "Degraded", dot: "bg-warning", bar: "bg-warning", width: "w-3/5" },
  not_configured: {
    text: "Not configured",
    dot: "bg-muted-foreground",
    bar: "bg-muted-foreground",
    width: "w-1/12",
  },
} as const;
function SystemStatusTile({ name, status }: { name: string; status: keyof typeof STATUS_MAP }) {
  const item = STATUS_MAP[status];
  return (
    <div className="flex flex-col gap-3 bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          {name}
        </span>
        <span className={cn("h-1.5 w-1.5 rounded-full", item.dot)} />
      </div>
      <p className="text-sm font-medium text-foreground">{item.text}</p>
      <div className="h-1 w-full bg-surface-2">
        <div className={cn("h-1", item.bar, item.width)} />
      </div>
    </div>
  );
}
