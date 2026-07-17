import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileTopBar } from "./MobileTopBar";
import { MobileBottomNav } from "./MobileBottomNav";
import { TopStatusBar } from "./TopStatusBar";

/**
 * Authenticated app layout: a persistent desktop sidebar, a mobile top bar
 * + bottom nav, and the routed page content. Composed from small, focused
 * pieces (DesktopSidebar, MobileTopBar, MobileBottomNav, and the shared
 * SidebarNav/UserProfile they render) instead of one monolithic component.
 *
 * `app-terminal` scopes the Bloomberg-terminal x Apple design tokens
 * (see styles.css) to the authenticated app only — the marketing site is
 * unaffected.
 */
export function AppShell({
  user,
  children,
}: {
  user: { email?: string | null; id: string };
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="app-terminal flex min-h-screen w-full bg-background text-foreground">
      <DesktopSidebar user={user} onSignOut={handleSignOut} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar onSignOut={handleSignOut} />
        <TopStatusBar className="hidden md:flex" />
        <MobileBottomNav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 md:pt-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
