import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function formatUtc(date: Date) {
  return `${date.getUTCHours().toString().padStart(2, "0")}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")}`;
}

/**
 * Persistent status strip shown above the routed page content on md+
 * screens: connection status, market-session indicator, and a live UTC
 * clock, matching the approved terminal design. Purely presentational —
 * it renders client-side state only (clock tick) and carries no business
 * logic of its own.
 */
export function TopStatusBar({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-11 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-none lg:px-8",
        className,
      )}
    >
      <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          SYS_OK
        </span>
        <span className="hidden sm:inline">MKT: OPEN</span>
        <span className="tabular-nums">{now ? formatUtc(now) : "--:--:--"} UTC</span>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <button type="button" aria-label="Search" className="hover:text-foreground">
          <Search className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label="Notifications" className="hover:text-foreground">
          <Bell className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
