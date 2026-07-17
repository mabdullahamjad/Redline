import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.08] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:py-32">
        <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
          Forex · Crypto · Metals · Global Indices
        </span>
        <h1 className="mt-7 text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-6xl">
          Know before the
          <br />
          market moves.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground">
          Redline tracks the macro calendar that actually moves markets — central bank decisions,
          inflation prints, and employment data — and delivers precisely-timed alerts before the
          tape reacts.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-sm bg-destructive px-7 font-mono text-xs uppercase tracking-wide text-destructive-foreground hover:bg-destructive/90"
          >
            <Link to="/auth" search={{ mode: "register" } as never}>
              Get started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-sm border-border font-mono text-xs uppercase tracking-wide"
          >
            <a href="#snapshot">
              View live calendar <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
