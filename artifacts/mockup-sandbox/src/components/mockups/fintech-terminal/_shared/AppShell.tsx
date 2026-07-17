import React from 'react';
import { Activity, LayoutDashboard, Settings, ShieldCheck, Search, Bell } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/__mockup/preview/fintech-terminal/Dashboard' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/__mockup/preview/fintech-terminal/Settings' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, href: '/__mockup/preview/fintech-terminal/Admin' },
];

export function AppShell({ children, activeTab }: { children: React.ReactNode, activeTab: string }) {
  return (
    <div className="terminal-theme min-h-screen flex w-full text-[13px] bg-[var(--bg)] text-[var(--text-main)] selection:bg-[var(--accent)] selection:text-[var(--text-inverse)]">
      {/* Sidebar */}
      <aside className="w-[200px] flex-shrink-0 border-r flex flex-col bg-[var(--surface)]">
        <div className="h-12 border-b flex items-center px-4">
          <div className="flex items-center gap-2 text-[var(--text-main)] font-semibold text-sm">
            <Activity className="w-4 h-4" />
            <span>REDLINE</span>
          </div>
        </div>
        
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 transition-colors text-left font-medium ${
                  isActive 
                    ? 'bg-[var(--surface-active)] text-[var(--text-main)]' 
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)]'
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
                {item.label}
              </a>
            )
          })}
        </nav>
        
        <div className="p-3 border-t bg-[var(--bg)]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-[var(--text-main)] text-[var(--bg)] flex items-center justify-center text-[10px] font-bold">
              A
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-medium">alex@trader.io</span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wider">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg)]">
        {/* Top bar */}
        <header className="h-12 border-b flex items-center justify-between px-6 bg-[var(--surface)]">
          <div className="flex items-center text-[var(--text-muted)] text-[11px] font-mono tracking-wide">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--impact-success)]"></span>
              SYS_OK
            </span>
            <span className="mx-3 text-[var(--border-strong)]">/</span>
            <span>MKT: OPEN</span>
            <span className="mx-3 text-[var(--border-strong)]">/</span>
            <span>UTC 14:32:01</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[var(--impact-high)] rounded-full translate-x-0.5 -translate-y-0.5" />
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
