"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUp } from "@/actions/auth-actions";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signUp({ fullName, email, password });
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.location.href = "https://www.ar-solutions-plc.com/";
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="kpi-card w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="brand-mark">AR</div>
          <div className="text-center">
            <h1 className="font-display text-xl font-semibold" style={{ color: "var(--color-text)" }}>
              Request Access
            </h1>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>Addis Reality KPI System</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md p-3 text-sm" style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-signal-bad)" }}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "Submitting…" : "Sign Up"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs" style={{ color: "var(--color-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="underline" style={{ color: "var(--color-brand-400)" }}>
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
