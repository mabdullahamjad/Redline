import { SidebarNav } from "./SidebarNav";

/** Fixed bottom navigation shown only on small screens. */
export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-sidebar py-2 md:hidden">
      <SidebarNav variant="mobile" />
    </nav>
  );
}
