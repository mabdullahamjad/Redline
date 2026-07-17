import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function BrandMark({
  size = "md",
  withWordmark = true,
  variant = "default",
}: {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  /** "terminal" renders the flat, monochrome mark used by the authenticated
   * app shell and auth screens. "default" keeps the marketing gradient mark. */
  variant?: "default" | "terminal";
}) {
  const dim = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  const iconDim = size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  if (variant === "terminal") {
    return (
      <Link to="/" className="inline-flex items-center gap-2">
        <Activity className={`${iconDim} text-foreground`} strokeWidth={2} />
        {withWordmark && (
          <span className={`font-medium ${text} tracking-tight text-foreground`}>REDLINE</span>
        )}
      </Link>
    );
  }

  return (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <span className={`grid ${dim} place-items-center rounded-xl gradient-primary shadow-glow`}>
        <Activity className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
      </span>
      {withWordmark && (
        <span className={`font-display ${text} font-bold tracking-tight`}>
          RED<span className="text-gradient">LINE</span>
        </span>
      )}
    </Link>
  );
}
