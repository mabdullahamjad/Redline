import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

/**
 * Shared nav link list for both the desktop sidebar and the mobile bottom
 * bar. Reads the active route itself so callers never need to thread the
 * current pathname down as a prop.
 */
export function SidebarNav({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (variant === "mobile") {
    return (
      <>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {navItems.map((item) => {
        const active = pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
              active
                ? "bg-surface-active text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
