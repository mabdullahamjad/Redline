import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  hint,
  className,
  layout = "block",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  className?: string;
  /** "block": label on top, big value below (dashboard stat strip).
   * "row": label left, value right, compact (admin metric list). */
  layout?: "block" | "row";
}) {
  if (layout === "row") {
    return (
      <div className={cn("flex items-center justify-between gap-3 py-1.5", className)}>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-mono text-sm font-medium text-foreground">{value}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="font-mono text-2xl font-medium tabular-nums text-foreground">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
