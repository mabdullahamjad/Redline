import React from 'react';
import { AppShell } from './_shared/AppShell';
import './_shared/tokens.css';

const USERS = [
  { email: 'alex@trader.io', plan: 'PRO', status: 'ACTIVE', lastLogin: '10m ago' },
  { email: 'sarah.j@macro.com', plan: 'ENTERPRISE', status: 'ACTIVE', lastLogin: '1h ago' },
  { email: 'hk_desk@fund.net', plan: 'PRO', status: 'INACTIVE', lastLogin: '3d ago' },
];

const LOGS = [
  { id: 'evt_9123', target: 'alex@trader.io', event: 'US NFP (USD)', status: 'DELIVERED', ms: '142ms' },
  { id: 'evt_9124', target: 'sarah.j@macro.com', event: 'US NFP (USD)', status: 'DELIVERED', ms: '156ms' },
  { id: 'evt_9125', target: 'hk_desk@fund.net', event: 'US NFP (USD)', status: 'FAILED', ms: '410ms' },
];

export default function Admin() {
  return (
    <AppShell activeTab="admin">
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight">System Operations</h1>
            <p className="text-[var(--text-muted)] mt-1">Platform health and delivery logs.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--impact-success)] animate-pulse" />
            <span className="text-xs font-mono tracking-wide text-[var(--impact-success)]">ALL SYSTEMS NOMINAL</span>
          </div>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 border bg-[var(--surface)]">
          <div className="p-4 border-b md:border-b-0 md:border-r">
            <div className="text-[10px] font-mono text-[var(--text-muted)] mb-3">API ENDPOINT</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg">99.99%</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[var(--impact-low-bg)] text-[var(--impact-low)]">HEALTHY</span>
            </div>
            <div className="mt-2 h-1 bg-[var(--border)] w-full overflow-hidden">
              <div className="h-full bg-[var(--impact-low)] w-full"></div>
            </div>
          </div>
          <div className="p-4 border-b md:border-b-0 md:border-r">
            <div className="text-[10px] font-mono text-[var(--text-muted)] mb-3">EMAIL RELAY</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg">99.98%</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[var(--impact-low-bg)] text-[var(--impact-low)]">HEALTHY</span>
            </div>
            <div className="mt-2 h-1 bg-[var(--border)] w-full overflow-hidden">
              <div className="h-full bg-[var(--impact-low)] w-[99%]"></div>
            </div>
          </div>
          <div className="p-4 border-b md:border-b-0 md:border-r">
            <div className="text-[10px] font-mono text-[var(--text-muted)] mb-3">SCHEDULER</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg">94.20%</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[var(--impact-med-bg)] text-[var(--impact-med)]">DEGRADED</span>
            </div>
            <div className="mt-2 h-1 bg-[var(--border)] w-full overflow-hidden">
              <div className="h-full bg-[var(--impact-med)] w-[94%]"></div>
            </div>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-muted)]">Users</span>
              <span className="font-mono">1,402</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-muted)]">Events Tracked</span>
              <span className="font-mono">8,914</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">Notifs (24h)</span>
              <span className="font-mono">42,105</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Users */}
          <div className="space-y-4">
            <h2 className="font-medium">Active Users</h2>
            <div className="border bg-[var(--surface)]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-hover)]">
                    <th className="py-2 px-4 font-normal">EMAIL</th>
                    <th className="py-2 px-4 font-normal">PLAN</th>
                    <th className="py-2 px-4 font-normal text-right">LAST SEEN</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {USERS.map((u, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-[var(--surface-hover)]">
                      <td className="py-2.5 px-4 font-mono text-xs flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-[var(--impact-success)]' : 'bg-[var(--border-strong)]'}`} />
                        {u.email}
                      </td>
                      <td className="py-2.5 px-4"><span className="px-1 border text-[9px] font-mono text-[var(--text-muted)]">{u.plan}</span></td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs text-[var(--text-muted)]">{u.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Log */}
          <div className="space-y-4">
            <h2 className="font-medium">Delivery Log</h2>
            <div className="border bg-[var(--surface)]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-hover)]">
                    <th className="py-2 px-4 font-normal">ID</th>
                    <th className="py-2 px-4 font-normal">TARGET</th>
                    <th className="py-2 px-4 font-normal text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {LOGS.map((l, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-[var(--surface-hover)]">
                      <td className="py-2.5 px-4 font-mono text-[10px] text-[var(--text-muted)]">{l.id}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-mono text-xs">{l.target}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{l.event}</div>
                      </td>
                      <td className="py-2.5 px-4 text-right flex flex-col items-end">
                        <span className={`text-[10px] font-mono ${l.status === 'DELIVERED' ? 'text-[var(--impact-success)]' : 'text-[var(--impact-high)]'}`}>
                          {l.status}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{l.ms}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
