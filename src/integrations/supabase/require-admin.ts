// Server-side admin authorization middleware.
// Composes on top of `requireSupabaseAuth` (verified JWT) and additionally
// verifies the caller holds the `admin` role via the `has_role` RPC before
// letting any admin-only server function run. Never trust a client-side
// role check alone — this is the enforcement point every admin server
// function must go through.
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "./auth-middleware";

export const requireAdminAuth = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (error) {
      setResponseStatus(500);
      throw new Error(error.message);
    }

    if (!data) {
      setResponseStatus(403);
      throw new Error("Forbidden: admin role required");
    }

    return next({ context: { isAdmin: true as const } });
  });
