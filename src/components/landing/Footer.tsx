import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-foreground" strokeWidth={2} />
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
            Redline
          </span>
        </Link>
        <p className="font-mono text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Redline. Know before the market moves.
        </p>
        <nav className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          <a href="#snapshot" className="transition hover:text-foreground">
            Live calendar
          </a>
          <a href="#how" className="transition hover:text-foreground">
            How it works
          </a>
          <a href="#why" className="transition hover:text-foreground">
            Why Redline
          </a>
        </nav>
      </div>
    </footer>
  );
}
