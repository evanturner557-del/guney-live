"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Reached via the recovery link (callback establishes a session first).
export default function ResetPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); setState("error"); return; }
    setState("loading"); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setState("error"); return; }
    window.location.href = "/dashboard";
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="display text-2xl font-semibold text-olive-deep">Choose a new password</h1>
      <form onSubmit={submit} className="mt-6 bg-white rounded-2xl border border-sand p-6 space-y-3">
        <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 6)" className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
        <input required type="password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
        <button disabled={state === "loading"} className="w-full py-3 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors cursor-pointer disabled:opacity-60">{state === "loading" ? "Saving…" : "Set new password"}</button>
        {state === "error" && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </div>
  );
}
