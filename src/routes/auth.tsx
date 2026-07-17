import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandMark } from "@/components/shared/BrandMark";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["login", "register", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register" | "forgot">(mode ?? "login");

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailSent, setEmailSent] = useState<null | "verify" | "reset">(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setEmailSent("verify");
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setEmailSent("reset");
  }

  return (
    <div className="app-terminal grid min-h-screen w-full bg-background text-foreground lg:grid-cols-2">
      {/* Branding pane */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px]" />
        <BrandMark variant="terminal" />
        <div className="relative max-w-sm space-y-4 font-mono text-xs leading-relaxed text-muted-foreground">
          <p className="text-foreground">// live market calendar</p>
          <p>USD NFP .......... HIGH · 08:30 ET</p>
          <p>EUR ECB RATE ...... HIGH · 07:45 ET</p>
          <p>GBP CPI Y/Y ..... MED · 06:00 ET</p>
          <p className="pt-2 text-foreground">
            Precisely-timed alerts for the events that move markets.
          </p>
        </div>
        <p className="relative font-mono text-[10px] text-muted-foreground">REDLINE Terminal</p>
      </div>

      {/* Form pane */}
      <div className="flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark variant="terminal" size="lg" />
          </div>

          {emailSent ? (
            <div className="border border-border bg-card p-8 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center border border-border text-foreground">
                <MailCheck className="h-4 w-4" />
              </div>
              <h2 className="mt-5 text-lg font-medium text-foreground">
                {emailSent === "verify" ? "Verify your email" : "Check your inbox"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {emailSent === "verify"
                  ? `We sent a verification link to ${email}. Click it to activate your account.`
                  : `We sent a password reset link to ${email}.`}
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setEmailSent(null);
                  setTab("login");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <div>
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                <TabsList className="grid w-full grid-cols-2 rounded-none border border-border bg-transparent p-0">
                  <TabsTrigger
                    value="login"
                    className="rounded-none border-r border-border font-mono text-xs uppercase tracking-wide data-[state=active]:bg-surface-active data-[state=active]:shadow-none"
                  >
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-none font-mono text-xs uppercase tracking-wide data-[state=active]:bg-surface-active data-[state=active]:shadow-none"
                  >
                    Create account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <Field label="Email" type="email" value={email} onChange={setEmail} />
                    <Field
                      label="Password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setTab("forgot")}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Submit loading={loading}>Sign in</Submit>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <form className="space-y-4" onSubmit={handleRegister}>
                    <Field label="Email" type="email" value={email} onChange={setEmail} />
                    <Field
                      label="Password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      hint="At least 6 characters"
                    />
                    <Submit loading={loading}>Create account</Submit>
                    <p className="text-center text-xs text-muted-foreground">
                      By continuing you agree to receive event alert emails.
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="forgot" className="mt-6">
                  <form className="space-y-4" onSubmit={handleForgot}>
                    <p className="text-sm text-muted-foreground">
                      Enter your email and we'll send you a reset link.
                    </p>
                    <Field label="Email" type="email" value={email} onChange={setEmail} />
                    <Submit loading={loading}>Send reset link</Submit>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setTab("login")}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        ← Back to sign in
                      </button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === "password" ? "current-password" : "email"}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Submit({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}
