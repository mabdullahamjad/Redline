import { cn } from "@/lib/utils";
import type { ImpactLevel } from "@/lib/constants";

const styles: Record<ImpactLevel, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

const terminalStyles: Record<ImpactLevel, string> = {
  high: "text-destructive border-destructive/40",
  medium: "text-warning border-warning/40",
  low: "text-info border-info/40",
};

export function ImpactBadge({
  impact,
  className,
  variant = "default",
}: {
  impact: ImpactLevel | string;
  className?: string;
  /** "terminal" renders the flat, square, mono chip used by the authenticated app. */
  variant?: "default" | "terminal";
}) {
  const key = (impact in styles ? impact : "low") as ImpactLevel;

  if (variant === "terminal") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-sm border bg-transparent px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
          terminalStyles[key],
          className,
        )}
      >
        {impact}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
        styles[key],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {impact}
    </span>
  );
}
