import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdminAuth } from "@/integrations/supabase/require-admin";

type OperationalStatus = "healthy" | "degraded" | "not_configured";

function statusFromTimestamp(timestamp: string | null, maxAgeMinutes: number): OperationalStatus {
  if (!timestamp) return "not_configured";
  return Date.now() - new Date(timestamp).getTime() <= maxAgeMinutes * 60_000
    ? "healthy"
    : "degraded";
}

export const adminCheck = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return { isAdmin: Boolean(data) };
  });

export const adminListEvents = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("events")
      .select("id, title, currency, impact, event_time")
      .order("event_time", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListLogs = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { data: logs, error: logsError } = await context.supabase
      .from("notification_logs")
      .select(
        "id, event_id, recipient_email, notification_type, status, sent_at, last_attempt_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (logsError) throw new Error(logsError.message);
    if (!logs?.length) return [];

    const eventIds = [...new Set(logs.map((log) => log.event_id))];
    const { data: events, error: eventsError } = await context.supabase
      .from("events")
      .select("id, title, currency")
      .in("id", eventIds);
    if (eventsError) throw new Error(eventsError.message);

    const eventsById = new Map((events ?? []).map((event) => [event.id, event]));
    return logs.map((log) => ({ ...log, event: eventsById.get(log.event_id) ?? null }));
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, email, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSystemStatus = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const [
      users,
      events,
      subscriptions,
      pending,
      processing,
      sent,
      failed,
      latestEvent,
      latestRun,
      latestSent,
    ] = await Promise.all([
      context.supabase.from("profiles").select("id", { count: "exact", head: true }),
      context.supabase.from("events").select("id", { count: "exact", head: true }),
      context.supabase.from("subscriptions").select("id", { count: "exact", head: true }),
      context.supabase
        .from("notification_logs")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      context.supabase
        .from("notification_logs")
        .select("id", { count: "exact", head: true })
        .eq("status", "processing"),
      context.supabase
        .from("notification_logs")
        .select("id", { count: "exact", head: true })
        .eq("status", "sent"),
      context.supabase
        .from("notification_logs")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed"),
      context.supabase
        .from("events")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      context.supabase
        .from("notification_logs")
        .select("last_attempt_at")
        .not("last_attempt_at", "is", null)
        .order("last_attempt_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      context.supabase
        .from("notification_logs")
        .select("sent_at")
        .not("sent_at", "is", null)
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    for (const result of [
      users,
      events,
      subscriptions,
      pending,
      processing,
      sent,
      failed,
      latestEvent,
      latestRun,
      latestSent,
    ]) {
      if (result.error)
        throw new Error(`Could not load operational status: ${result.error.message}`);
    }

    const lastNotificationRun = latestRun.data?.last_attempt_at ?? null;
    const lastDelivery = latestSent.data?.sent_at ?? null;
    return {
      users: users.count ?? 0,
      events: events.count ?? 0,
      subscriptions: subscriptions.count ?? 0,
      notifications: sent.count ?? 0,
      metrics: {
        pending: pending.count ?? 0,
        processing: processing.count ?? 0,
        sent: sent.count ?? 0,
        failed: failed.count ?? 0,
      },
      lastSyncAt: latestEvent.data?.updated_at ?? null,
      lastNotificationRun,
      lastDelivery,
      api: {
        name: "FMP sync",
        status: statusFromTimestamp(latestEvent.data?.updated_at ?? null, 24 * 60),
      },
      email: {
        name: "Resend delivery",
        status: lastDelivery ? ("healthy" as const) : ("not_configured" as const),
      },
      scheduler: {
        name: "Notification scheduler",
        status: statusFromTimestamp(lastNotificationRun, 10),
      },
    };
  });
