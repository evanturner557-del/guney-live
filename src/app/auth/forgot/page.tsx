"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading"); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    });
    if (error) { setError(error.message); setState("error"); return; }
    setState("sent");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="display text-2xl font-semibold text-olive-deep">Reset your password</h1>
      {state === "sent" ? (
        <div className="mt-6 bg-white rounded-2xl border border-sand p-8 text-center">
          <p className="text-2xl mb-2">📬</p>
          <p className="text-faded text-sm">If an account exists for <strong className="text-ink">{email}</strong>, we&apos;ve sent a reset link. Open it to choose a new password.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 bg-white rounded-2xl border border-sand p-6 space-y-3">
          <p className="text-sm text-faded">Enter your email and we&apos;ll send you a link to set a new password.</p>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          <button disabled={state === "loading"} className="w-full py-3 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors cursor-pointer disabled:opacity-60">{state === "loading" ? "Sending…" : "Send reset link"}</button>
          {state === "error" && <p className="text-sm text-red-700">{error}</p>}
          <Link href="/join" className="block text-center text-xs text-faded hover:text-ink">Back to sign in</Link>
        </form>
      )}
    </div>
  );
}
