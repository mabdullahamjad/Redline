import "./_group.css";
import { Activity, Bell, Calendar, CheckCircle2, LayoutDashboard, LogOut, Settings, ShieldCheck, Zap } from "lucide-react";

// Faithful baseline extraction of the current app's Dashboard + AppShell,
// using the exact tokens from src/styles.css (see _group.css) and the exact
// markup/classes from src/routes/_authenticated/dashboard.tsx,
// src/components/app/*, src/components/shared/*. This is the "before" —
// generic dark-SaaS gradients, glass cards, glow shadows — used only as a
// visual reference for the redesign, not shipped anywhere.

const c = {
  bg: "oklch(0.16 0.015 250)",
  fg: "oklch(0.97 0.005 250)",
  surface: "oklch(0.20 0.018 250)",
  surface2: "oklch(0.235 0.02 250)",
  primary: "oklch(0.78 0.14 200)",
  primaryFg: "oklch(0.15 0.02 250)",
  muted: "oklch(0.68 0.015 250)",
  border: "oklch(0.30 0.015 250 / 0.6)",
  success: "oklch(0.74 0.16 155)",
  destructive: "oklch(0.66 0.22 22)",
};

function StatCard({ label, value, icon, hint }: { label: string; value: string; icon: React.ReactNode; hint: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{
        borderColor: c.border,
        backgroundImage: `linear-gradient(180deg, ${c.surface2} 0%, ${c.surface} 100%)`,
        boxShadow: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.5)",
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: c.muted }}>{label}</p>
        <span style={{ color: c.primary, opacity: 0.8 }}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: c.fg }}>{value}</p>
      <p className="mt-1 text-xs" style={{ color: c.muted }}>{hint}</p>
    </div>
  );
}

export function Current() {
  const nav = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    { label: "Settings", icon: Settings, active: false },
    { label: "Admin", icon: ShieldCheck, active: false },
  ];

  return (
    <div className="ep-current flex min-h-screen w-full" style={{ backgroundColor: c.bg, color: c.fg, fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className="flex h-screen w-64 shrink-0 flex-col border-r" style={{ borderColor: c.border, backgroundColor: "oklch(0.18 0.017 250 / 0.6)" }}>
        <div className="px-5 py-5">
          <div className="inline-flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-xl"
              style={{ backgroundImage: `linear-gradient(135deg, ${c.primary} 0%, oklch(0.72 0.16 165) 100%)`, boxShadow: `0 0 0 1px ${c.primary}26, 0 20px 60px -20px ${c.primary}59` }}
            >
              <Activity className="h-4 w-4" style={{ color: c.primaryFg }} strokeWidth={2.5} />
            </span>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Event<span style={{ color: c.primary }}>Pulse</span>
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
              style={item.active ? { backgroundColor: `${c.primary}1a`, color: c.primary } : { color: c.muted }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          ))}
        </nav>
        <div className="border-t p-4" style={{ borderColor: c.border }}>
          <div className="mb-3 flex items-center gap-3">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold"
              style={{ backgroundImage: `linear-gradient(135deg, ${c.primary} 0%, oklch(0.72 0.16 165) 100%)`, color: c.primaryFg }}
            >
              A
            </div>
            <div>
              <p className="truncate text-sm font-medium">alex@trader.io</p>
              <p className="text-xs" style={{ color: c.muted }}>Signed in</p>
            </div>
          </div>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: c.border }}>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        className="flex-1 px-8 py-8"
        style={{
          backgroundImage: `radial-gradient(1200px 600px at 100% -10%, ${c.primary}0f, transparent 60%), radial-gradient(1000px 500px at -10% 20%, oklch(0.72 0.16 165 / 0.05), transparent 60%)`,
        }}
      >
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: c.primary }}>Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Welcome back, alex</h1>
            <p className="mt-2 text-sm" style={{ color: c.muted }}>Your live view of upcoming events and delivery status.</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Currencies" value="3" icon={<Zap className="h-4 w-4" />} hint="USD · EUR · GBP" />
            <StatCard label="Impact levels" value="2" icon={<Bell className="h-4 w-4" />} hint="High · Medium" />
            <StatCard label="Lead times" value="2" icon={<Calendar className="h-4 w-4" />} hint="24h · 1h" />
            <StatCard label="Status" value="Active" icon={<CheckCircle2 className="h-4 w-4" />} hint="Ready to deliver alerts" />
          </div>

          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: c.border, backgroundImage: `linear-gradient(180deg, ${c.surface2} 0%, ${c.surface} 100%)`, boxShadow: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.5)" }}
          >
            <h3 className="mb-1 text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upcoming economic events</h3>
            <p className="mb-5 text-sm" style={{ color: c.muted }}>Events matching your filters will appear here.</p>
            {[
              { title: "US Non-Farm Payrolls", ccy: "USD", impact: "high", time: "Fri 14 Jul, 08:30" },
              { title: "ECB Rate Decision", ccy: "EUR", impact: "high", time: "Thu 20 Jul, 12:45" },
              { title: "UK CPI y/y", ccy: "GBP", impact: "medium", time: "Wed 19 Jul, 06:00" },
            ].map((e) => (
              <div key={e.title} className="flex items-center justify-between border-t py-3 first:border-t-0" style={{ borderColor: c.border }}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{e.title}</p>
                    <span className="rounded-md border px-2 py-0.5 font-mono text-xs font-semibold" style={{ borderColor: c.border, backgroundColor: c.surface2 }}>{e.ccy}</span>
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: c.muted }}>{e.time}</p>
                </div>
                <span
                  className="rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide"
                  style={
                    e.impact === "high"
                      ? { color: c.destructive, borderColor: `${c.destructive}4d`, backgroundColor: `${c.destructive}26` }
                      : { color: "oklch(0.80 0.16 75)", borderColor: "oklch(0.80 0.16 75 / 0.3)", backgroundColor: "oklch(0.80 0.16 75 / 0.15)" }
                  }
                >
                  {e.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
