import { ListFilter, Timer, BellRing } from "lucide-react";

const steps = [
  {
    icon: ListFilter,
    step: "01",
    title: "Choose your markets",
    desc: "Select the currencies, crypto pairs, metals, and indices you actually trade.",
  },
  {
    icon: Timer,
    step: "02",
    title: "Set your lead time",
    desc: "24h, 12h, or 1h before print — stack them or pick one to keep your inbox lean.",
  },
  {
    icon: BellRing,
    step: "03",
    title: "Receive intelligent alerts",
    desc: "Redline emails you before every release that matches your filters. Nothing else.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          How it works
        </p>
        <h2 className="mt-2 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Three steps from signup to signal
        </h2>

        <div className="mt-12 grid gap-0 border border-border bg-card md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className={`relative p-7 ${i < steps.length - 1 ? "border-b border-border md:border-b-0 md:border-r" : ""}`}
            >
              <span className="font-mono text-[10px] text-muted-foreground">{s.step}</span>
              <div className="mt-3 grid h-10 w-10 place-items-center rounded-sm border border-border bg-surface text-foreground">
                <s.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-base font-medium text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
