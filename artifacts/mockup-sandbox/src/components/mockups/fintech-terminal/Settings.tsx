import React, { useState } from 'react';
import { AppShell } from './_shared/AppShell';
import './_shared/tokens.css';
import { Check } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
const IMPACTS = [
  { id: 'HIGH', label: 'High Impact', desc: 'Major market movers (e.g., Rate Decisions, NFP, CPI)' },
  { id: 'MED', label: 'Medium Impact', desc: 'Significant events (e.g., GDP prelim, Retail Sales)' },
  { id: 'LOW', label: 'Low Impact', desc: 'Minor data releases (e.g., Trade Balance, Auto Sales)' },
];
const LEAD_TIMES = [
  { id: '24h', label: '24 Hours Before', desc: 'For daily planning and positioning.' },
  { id: '12h', label: '12 Hours Before', desc: 'Overnight preparation.' },
  { id: '1h', label: '1 Hour Before', desc: 'Immediate pre-event alert.' },
];

export default function Settings() {
  const [selectedCcy, setSelectedCcy] = useState<Set<string>>(new Set(['USD', 'EUR', 'GBP']));
  const [selectedImpacts, setSelectedImpacts] = useState<Set<string>>(new Set(['HIGH', 'MED']));
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set(['24h', '1h']));
  const [email, setEmail] = useState('alex@trader.io');
  const [isSaving, setIsSaving] = useState(false);

  const toggleCcy = (c: string) => {
    const next = new Set(selectedCcy);
    next.has(c) ? next.delete(c) : next.add(c);
    setSelectedCcy(next);
  };

  const toggleImpact = (i: string) => {
    const next = new Set(selectedImpacts);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelectedImpacts(next);
  };

  const toggleTime = (t: string) => {
    const next = new Set(selectedTimes);
    next.has(t) ? next.delete(t) : next.add(t);
    setSelectedTimes(next);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <AppShell activeTab="settings">
      <div className="p-8 max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
        
        <div>
          <h1 className="text-xl font-medium tracking-tight">Alert Preferences</h1>
          <p className="text-[var(--text-muted)] mt-1">Configure what events you want to be notified about.</p>
        </div>

        <div className="space-y-8">
          
          {/* Currencies */}
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Currencies</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Select the currencies you actively trade.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map(c => {
                const active = selectedCcy.has(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCcy(c)}
                    className={`px-4 py-2 font-mono text-xs border transition-all duration-200 ${
                      active 
                        ? 'bg-[var(--text-main)] text-[var(--bg)] border-[var(--text-main)]' 
                        : 'bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </section>

          <hr className="border-[var(--border)]" />

          {/* Impacts */}
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Impact Levels</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Filter by the expected market volatility.</p>
            </div>
            <div className="space-y-2">
              {IMPACTS.map(imp => {
                const active = selectedImpacts.has(imp.id);
                return (
                  <button
                    key={imp.id}
                    onClick={() => toggleImpact(imp.id)}
                    className={`w-full flex items-center justify-between p-3 border text-left transition-colors ${
                      active ? 'border-[var(--text-main)] bg-[var(--surface-hover)]' : 'bg-[var(--surface)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {imp.label}
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono ${
                          imp.id === 'HIGH' ? 'bg-[var(--impact-high-bg)] text-[var(--impact-high)]' :
                          imp.id === 'MED' ? 'bg-[var(--impact-med-bg)] text-[var(--impact-med)]' :
                          'bg-[var(--impact-low-bg)] text-[var(--impact-low)]'
                        }`}>{imp.id}</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">{imp.desc}</div>
                    </div>
                    <div className={`w-4 h-4 border flex items-center justify-center ${active ? 'bg-[var(--text-main)] border-[var(--text-main)] text-[var(--bg)]' : 'border-[var(--border-strong)]'}`}>
                      {active && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <hr className="border-[var(--border)]" />

          {/* Lead Times */}
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Notification Lead Times</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">When should we send the alerts?</p>
            </div>
            <div className="space-y-2">
              {LEAD_TIMES.map(lt => {
                const active = selectedTimes.has(lt.id);
                return (
                  <button
                    key={lt.id}
                    onClick={() => toggleTime(lt.id)}
                    className={`w-full flex items-center justify-between p-3 border text-left transition-colors ${
                      active ? 'border-[var(--text-main)] bg-[var(--surface-hover)]' : 'bg-[var(--surface)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm font-mono">{lt.label}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">{lt.desc}</div>
                    </div>
                    <div className={`w-4 h-4 border flex items-center justify-center ${active ? 'bg-[var(--text-main)] border-[var(--text-main)] text-[var(--bg)]' : 'border-[var(--border-strong)]'}`}>
                      {active && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <hr className="border-[var(--border)]" />

          {/* Delivery */}
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Delivery Destination</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Where should we route your alerts.</p>
            </div>
            <div className="max-w-md">
              <label className="block text-[10px] font-mono text-[var(--text-muted)] mb-1">EMAIL ADDRESS</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[var(--surface)] border px-3 py-2 text-sm focus:outline-none focus:border-[var(--text-main)] transition-colors"
              />
            </div>
          </section>

          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-mono">Last saved: 2 hours ago</span>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[var(--text-main)] text-[var(--bg)] px-6 py-2 text-sm font-medium hover:bg-[var(--text-muted)] transition-colors disabled:opacity-50 min-w-[120px]"
            >
              {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
