import { BrandMark } from "@/components/shared/BrandMark";
import { SidebarNav } from "./SidebarNav";
import { UserProfile } from "./UserProfile";

/** Persistent left sidebar shown on md+ screens. */
export function DesktopSidebar({
  user,
  onSignOut,
}: {
  user: { email?: string | null };
  onSignOut: () => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="px-5 py-5">
        <BrandMark variant="terminal" size="sm" />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        <SidebarNav variant="desktop" />
      </nav>
      <UserProfile user={user} onSignOut={onSignOut} />
    </aside>
  );
}
