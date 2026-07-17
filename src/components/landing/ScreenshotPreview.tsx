import { Zap, Bell, Calendar, CheckCircle2 } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { ImpactBadge } from "@/components/shared/ImpactBadge";
import { CurrencyPill } from "@/components/shared/CurrencyPill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const previewEvents = [
  { title: "US Non-Farm Payrolls", currency: "USD", impact: "high", when: "In 1 hour" },
  { title: "ECB Interest Rate Decision", currency: "EUR", impact: "high", when: "In 12 hours" },
  { title: "UK CPI y/y", currency: "GBP", impact: "medium", when: "In 24 hours" },
];

export function ScreenshotPreview() {
  return (
    <section id="preview" className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Inside the terminal
        </p>
        <h2 className="mt-2 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Your dashboard, once you're in
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          The same flat, hairline-bordered interface you'll trade from every day — no dashboards
          dressed up for a screenshot.
        </p>

        <div className="mt-10 border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Dashboard
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">Live preview</span>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-x-8 gap-y-4 border-b border-border pb-5">
              <StatCard
                label="Currencies"
                value="4"
                icon={<Zap className="h-3 w-3" />}
                hint="USD · EUR · GBP · JPY"
              />
              <StatCard
                label="Impact levels"
                value="2"
                icon={<Bell className="h-3 w-3" />}
                hint="High · Medium"
              />
              <StatCard
                label="Lead times"
                value="3"
                icon={<Calendar className="h-3 w-3" />}
                hint="24h · 12h · 1h"
              />
              <StatCard
                label="Status"
                value="Active"
                icon={<CheckCircle2 className="h-3 w-3" />}
                hint="Ready to deliver alerts"
              />
            </div>
            <SectionCard className="mt-5" title="Upcoming economic events" bodyClassName="mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewEvents.map((e) => (
                    <TableRow key={e.title}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>
                        <CurrencyPill code={e.currency} variant="terminal" />
                      </TableCell>
                      <TableCell>
                        <ImpactBadge impact={e.impact} variant="terminal" />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {e.when}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </div>
        </div>
      </div>
    </section>
  );
}
