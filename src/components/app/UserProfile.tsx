import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Signed-in user summary + sign-out action shown at the base of the
 * desktop sidebar.
 */
export function UserProfile({
  user,
  onSignOut,
}: {
  user: { email?: string | null };
  onSignOut: () => void;
}) {
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="border-t border-border p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="grid h-7 w-7 shrink-0 place-items-center border border-border bg-surface-2 font-mono text-xs font-medium text-foreground">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{user.email}</p>
          <p className="text-[10px] text-muted-foreground">Signed in</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full justify-start" onClick={onSignOut}>
        <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
      </Button>
    </div>
  );
}
