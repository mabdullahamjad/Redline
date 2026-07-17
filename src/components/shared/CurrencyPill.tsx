import { cn } from "@/lib/utils";

export function CurrencyPill({
  code,
  className,
  variant = "default",
}: {
  code: string;
  className?: string;
  /** "terminal" renders the flat mono chip used by the authenticated app. */
  variant?: "default" | "terminal";
}) {
  if (variant === "terminal") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-sm border border-border bg-transparent px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-muted-foreground",
          className,
        )}
      >
        {code}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-foreground",
        className,
      )}
    >
      {code}
    </span>
  );
}
