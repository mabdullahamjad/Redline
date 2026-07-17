import React, { useState, useEffect } from 'react';
import { AppShell } from './_shared/AppShell';
import './_shared/tokens.css';

const MOCK_EVENTS = [
  { id: 1, title: 'US Non-Farm Payrolls', ccy: 'USD', impact: 'HIGH', time: '08:30', date: 'Jul 14' },
  { id: 2, title: 'ECB Rate Decision', ccy: 'EUR', impact: 'HIGH', time: '12:45', date: 'Jul 20' },
  { id: 3, title: 'UK CPI y/y', ccy: 'GBP', impact: 'MED', time: '06:00', date: 'Jul 19' },
  { id: 4, title: 'BOJ Policy Statement', ccy: 'JPY', impact: 'HIGH', time: '03:00', date: 'Jul 28' },
  { id: 5, title: 'RBA Interest Rate Decision', ccy: 'AUD', impact: 'HIGH', time: '04:30', date: 'Aug 01' },
];

const MOCK_NOTIFS = [
  { id: 1, title: 'US Non-Farm Payrolls', type: '24h Warning', ccy: 'USD', sentTime: '08:30 (Yesterday)' },
  { id: 2, title: 'UK CPI y/y', type: '1h Warning', ccy: 'GBP', sentTime: '05:00' },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<typeof MOCK_EVENTS>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setEvents(MOCK_EVENTS);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppShell activeTab="dashboard">
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header Area */}
        <div>
          <h1 className="text-xl font-medium tracking-tight">Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-1">Live view of upcoming events and delivery status.</p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-x-12 gap-y-4 py-4 border-y">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">CURRENCIES</span>
            <span className="font-mono text-base">3 <span className="text-[var(--text-muted)] text-xs ml-1">USD, EUR, GBP</span></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">IMPACT FILTERS</span>
            <span className="font-mono text-base">2 <span className="text-[var(--text-muted)] text-xs ml-1">HIGH, MED</span></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">LEAD TIMES</span>
            <span className="font-mono text-base">2 <span className="text-[var(--text-muted)] text-xs ml-1">24h, 1h</span></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">STATUS</span>
            <span className="font-mono text-base text-[var(--impact-success)]">ACTIVE</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Upcoming Events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Upcoming Events</h2>
            </div>
            
            <div className="border bg-[var(--surface)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-hover)]">
                    <th className="py-2 px-4 font-normal w-24">DATE/TIME</th>
                    <th className="py-2 px-4 font-normal">EVENT</th>
                    <th className="py-2 px-4 font-normal w-16">CCY</th>
                    <th className="py-2 px-4 font-normal text-right w-20">IMPACT</th>
                  </tr>
                </thead>
                <tbody className="tabular-data text-[13px]">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4">
                          <div className="h-2 w-10 bg-[var(--surface-active)] mb-1.5 animate-pulse" />
                          <div className="h-2 w-8 bg-[var(--surface-active)] animate-pulse" />
                        </td>
                        <td className="py-3 px-4"><div className="h-3 w-48 bg-[var(--surface-active)] animate-pulse" /></td>
                        <td className="py-3 px-4"><div className="h-3 w-8 bg-[var(--surface-active)] animate-pulse" /></td>
                        <td className="py-3 px-4 flex justify-end"><div className="h-3 w-10 bg-[var(--surface-active)] animate-pulse" /></td>
                      </tr>
                    ))
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[var(--text-muted)]">
                        No upcoming events matching your filters.
                      </td>
                    </tr>
                  ) : (
                    events.map(e => (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-[var(--surface-hover)] transition-colors group">
                        <td className="py-2.5 px-4 font-mono text-xs text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
                          <span className="block">{e.date}</span>
                          <span className="block">{e.time}</span>
                        </td>
                        <td className="py-2.5 px-4 font-medium">{e.title}</td>
                        <td className="py-2.5 px-4 font-mono text-xs">{e.ccy}</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                            e.impact === 'HIGH' ? 'bg-[var(--impact-high-bg)] text-[var(--impact-high)]' :
                            e.impact === 'MED' ? 'bg-[var(--impact-med-bg)] text-[var(--impact-med)]' :
                            'bg-[var(--impact-low-bg)] text-[var(--impact-low)]'
                          }`}>
                            {e.impact}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Recent Notifications */}
          <div className="space-y-4">
            <h2 className="font-medium">Recent Notifications</h2>
            
            <div className="border bg-[var(--surface)]">
              {loading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="h-3 w-32 bg-[var(--surface-active)] animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-2 w-12 bg-[var(--surface-active)] animate-pulse" />
                        <div className="h-2 w-16 bg-[var(--surface-active)] animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : MOCK_NOTIFS.length === 0 ? (
                <div className="py-8 text-center text-[var(--text-muted)] text-sm">No recent notifications.</div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {MOCK_NOTIFS.map(n => (
                    <li key={n.id} className="p-3 hover:bg-[var(--surface-hover)] transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{n.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1 py-0.5 border text-[9px] font-mono text-[var(--text-muted)] group-hover:border-[var(--border-strong)] transition-colors">
                              {n.type}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--text-muted)]">{n.sentTime}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px]">{n.ccy}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
