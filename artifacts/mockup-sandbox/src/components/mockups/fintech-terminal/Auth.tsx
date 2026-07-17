import React, { useState } from 'react';
import './_shared/tokens.css';
import { Activity, ArrowRight } from 'lucide-react';

type AuthView = 'signin' | 'signup' | 'forgot' | 'verify';

export default function Auth() {
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (view === 'forgot' || view === 'signup') {
        setView('verify');
      } else {
        // Mock successful login - would redirect in real app
        alert("Logged in!");
      }
    }, 1000);
  };

  return (
    <div className="terminal-theme min-h-screen w-full flex bg-[var(--bg)] text-[var(--text-main)] selection:bg-[var(--accent)] selection:text-[var(--text-inverse)]">
      
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex flex-1 border-r bg-[var(--surface)] p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <Activity className="w-6 h-6" />
          <span className="text-xl font-semibold tracking-tight">REDLINE</span>
        </div>
        
        <div className="relative z-10 max-w-md">
          <p className="font-mono text-sm text-[var(--text-muted)] mb-4">SYSTEM_READY</p>
          <h2 className="text-3xl font-medium leading-tight mb-4 tracking-tight">
            Institutional-grade economic alerts.
          </h2>
          <p className="text-[var(--text-muted)]">
            Configure precision notifications for market-moving events before they hit the wire.
          </p>
        </div>

        {/* Decorative terminal background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none font-mono text-[10px] leading-none whitespace-pre select-none" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i}>{Math.random().toString(36).substring(2, 15).repeat(10)}</div>
          ))}
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-32 relative">
        <div className="w-full max-w-sm mx-auto">
          
          {view === 'verify' ? (
            <div className="space-y-6">
              <div className="w-12 h-12 border border-[var(--text-main)] flex items-center justify-center mb-8">
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-medium tracking-tight">Check your inbox</h1>
              <p className="text-[var(--text-muted)] text-sm">
                We sent a verification link to <span className="text-[var(--text-main)] font-mono">{email || 'your email'}</span>. Click it to continue.
              </p>
              <button 
                onClick={() => setView('signin')}
                className="text-sm font-medium hover:underline mt-8 block"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="lg:hidden flex items-center gap-2 mb-12">
                <Activity className="w-5 h-5" />
                <span className="font-semibold tracking-tight">REDLINE</span>
              </div>

              <div>
                <h1 className="text-2xl font-medium tracking-tight mb-2">
                  {view === 'signin' ? 'Sign in' : view === 'signup' ? 'Create account' : 'Reset password'}
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                  {view === 'signin' ? 'Enter your credentials to access the terminal.' : 
                   view === 'signup' ? 'Join the platform to set up your alerts.' : 
                   'We will send you instructions to reset your access.'}
                </p>
              </div>

              <div className="flex gap-4 border-b mb-8 text-sm">
                <button 
                  onClick={() => setView('signin')} 
                  className={`pb-2 transition-colors ${view === 'signin' ? 'border-b border-[var(--text-main)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setView('signup')} 
                  className={`pb-2 transition-colors ${view === 'signup' ? 'border-b border-[var(--text-main)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-[var(--text-muted)]">EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--surface)] border px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--text-main)] transition-colors"
                  />
                </div>
                
                {view !== 'forgot' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-mono text-[var(--text-muted)]">PASSWORD</label>
                      {view === 'signin' && (
                        <button 
                          type="button"
                          onClick={() => setView('forgot')}
                          className="text-[10px] font-mono hover:text-[var(--text-main)] text-[var(--text-muted)]"
                        >
                          FORGOT?
                        </button>
                      )}
                    </div>
                    <input 
                      type="password" 
                      required
                      className="w-full bg-[var(--surface)] border px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--text-main)] transition-colors"
                    />
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--text-main)] text-[var(--bg)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--text-muted)] transition-colors disabled:opacity-50 mt-4"
                >
                  {isLoading ? 'PROCESSING...' : view === 'signin' ? 'SIGN IN' : view === 'signup' ? 'CREATE ACCOUNT' : 'SEND LINK'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {view === 'forgot' && (
                <button 
                  onClick={() => setView('signin')}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center justify-center w-full mt-6"
                >
                  Back to sign in
                </button>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
