import { createClient } from "@supabase/supabase-js";
import { ResendProvider, renderReminder } from "../_shared/notifications/resend-provider.ts";

interface NotificationJob {
  id: string;
  recipient_email: string;
  title: string;
  country: string | null;
  currency: string;
  impact: string;
  event_time: string;
  market_assets: string[];
  reminder_interval_minutes: number;
}

function secretsMatch(expected: string, received: string | null): boolean {
  if (!received || expected.length !== received.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1)
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  return difference === 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const pipelineSecret = Deno.env.get("NOTIFICATION_PIPELINE_SECRET");
  if (
    !pipelineSecret ||
    !secretsMatch(pipelineSecret, request.headers.get("x-notification-pipeline-secret"))
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const resendFrom = Deno.env.get("RESEND_FROM_EMAIL");
  if (!url || !serviceRoleKey || !resendKey || !resendFrom) {
    return Response.json({ error: "Notification pipeline is not configured" }, { status: 503 });
  }

  const database = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const generated = await database.rpc("generate_due_notification_jobs");
  if (generated.error) {
    console.error(
      JSON.stringify({
        operation: "generate_due_notification_jobs",
        error: generated.error.message,
      }),
    );
    return Response.json({ error: "Job generation failed" }, { status: 502 });
  }

  const claimed = await database.rpc("claim_notification_jobs", { _limit: 50 });
  if (claimed.error) {
    console.error(
      JSON.stringify({ operation: "claim_notification_jobs", error: claimed.error.message }),
    );
    return Response.json({ error: "Job claiming failed" }, { status: 502 });
  }

  const provider = new ResendProvider(resendKey, resendFrom);
  let sent = 0;
  let failed = 0;
  const jobs = (claimed.data ?? []) as NotificationJob[];
  for (const job of jobs) {
    try {
      const delivery = await provider.send({
        to: job.recipient_email,
        idempotencyKey: `notification-${job.id}`,
        ...renderReminder(job),
      });
      const completed = await database.rpc("complete_notification_job", {
        _id: job.id,
        _provider_message_id: delivery.id,
      });
      if (completed.error) throw new Error("Unable to record successful delivery");
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email delivery failed";
      const failedJob = await database.rpc("fail_notification_job", {
        _id: job.id,
        _error_message: message,
      });
      if (failedJob.error)
        console.error(
          JSON.stringify({
            operation: "fail_notification_job",
            jobId: job.id,
            error: failedJob.error.message,
          }),
        );
      failed += 1;
    }
  }

  console.info(
    JSON.stringify({
      operation: "notification_pipeline",
      generated: generated.data ?? 0,
      claimed: jobs.length,
      sent,
      failed,
    }),
  );
  return Response.json({ generated: generated.data ?? 0, claimed: jobs.length, sent, failed });
});
