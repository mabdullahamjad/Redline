import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <Activity className="h-4 w-4 text-foreground" strokeWidth={2} />
          <span className="font-mono text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
            Redline
          </span>
        </Link>
        <nav className="hidden items-center gap-7 font-mono text-xs uppercase tracking-wide text-muted-foreground md:flex">
          <a href="#snapshot" className="transition hover:text-foreground">
            Live calendar
          </a>
          <a href="#how" className="transition hover:text-foreground">
            How it works
          </a>
          <a href="#why" className="transition hover:text-foreground">
            Why Redline
          </a>
          <a href="#preview" className="transition hover:text-foreground">
            Preview
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="font-mono text-xs">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-sm bg-destructive font-mono text-xs uppercase tracking-wide text-destructive-foreground hover:bg-destructive/90"
          >
            <Link to="/auth" search={{ mode: "register" } as never}>
              Get started
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
