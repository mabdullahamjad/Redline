import { Globe2, Bell, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";

const markets = ["Forex", "Crypto", "Gold", "Silver", "Global Indices"];

export function WhyRedline() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Why Redline
      </p>
      <h2 className="mt-2 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
        Built for the macro trader, not the casual watcher
      </h2>

      <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-card p-6">
          <StatCard
            label="Events tracked"
            value="100+"
            icon={<Globe2 className="h-3 w-3" />}
            hint="Central banks, inflation, employment, and growth releases"
          />
        </div>
        <div className="bg-card p-6">
          <StatCard
            label="Alert lead times"
            value="24h / 12h / 1h"
            icon={<Bell className="h-3 w-3" />}
            hint="Stack alerts to prepare, position, and confirm"
          />
        </div>
        <div className="bg-card p-6">
          <StatCard
            label="Signal, no noise"
            value="1 email / event"
            icon={<ShieldCheck className="h-3 w-3" />}
            hint="Unsubscribe or pause filters in a single click"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border border-border bg-surface/30 px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Market coverage
        </span>
        <div className="flex flex-wrap gap-1.5">
          {markets.map((m) => (
            <span
              key={m}
              className="rounded-sm border border-border px-2 py-0.5 font-mono text-[11px] text-foreground"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
