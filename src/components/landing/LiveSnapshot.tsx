import { Radio } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
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

const snapshot = [
  {
    time: "08:30",
    country: "USD",
    event: "Non-Farm Payrolls",
    impact: "high",
    markets: ["EUR/USD", "Gold", "S&P 500"],
    countdown: "01:42:11",
  },
  {
    time: "12:00",
    country: "EUR",
    event: "ECB Interest Rate Decision",
    impact: "high",
    markets: ["EUR/USD", "DAX"],
    countdown: "05:11:47",
  },
  {
    time: "18:00",
    country: "USD",
    event: "FOMC Statement",
    impact: "high",
    markets: ["BTC/USD", "Gold", "Nasdaq"],
    countdown: "11:03:22",
  },
  {
    time: "07:00",
    country: "GBP",
    event: "CPI y/y",
    impact: "medium",
    markets: ["GBP/USD", "FTSE 100"],
    countdown: "23:41:05",
  },
  {
    time: "23:50",
    country: "JPY",
    event: "BoJ Policy Statement",
    impact: "medium",
    markets: ["USD/JPY", "Nikkei 225"],
    countdown: "1d 09:17",
  },
  {
    time: "10:00",
    country: "XAU",
    event: "US Retail Sales m/m",
    impact: "low",
    markets: ["Gold", "Silver"],
    countdown: "1d 14:33",
  },
];

export function LiveSnapshot() {
  return (
    <section id="snapshot" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Radio className="h-3 w-3" />
          Live market snapshot
        </p>
        <h2 className="mt-2 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          The calendar, terminal-grade.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          A preview of the feed Redline members see — every high-impact release, countdown to print,
          and the instruments it typically moves.
        </p>
      </div>

      <SectionCard className="mt-8" bodyClassName="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Markets affected</TableHead>
              <TableHead className="text-right">Countdown</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshot.map((row) => (
              <TableRow key={row.event}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.time}
                </TableCell>
                <TableCell>
                  <CurrencyPill code={row.country} variant="terminal" />
                </TableCell>
                <TableCell className="font-medium">{row.event}</TableCell>
                <TableCell>
                  <ImpactBadge impact={row.impact} variant="terminal" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {row.markets.map((m) => (
                      <span
                        key={m}
                        className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums text-foreground">
                  {row.countdown}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        Illustrative data — your live feed populates once you set your filters.
      </p>
    </section>
  );
}
