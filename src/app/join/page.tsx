"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function JoinPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [connection, setConnection] = useState("newcomer");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name, connection },
      },
    });
    if (error) {
      setError(error.message);
      setState("error");
    } else {
      setState("sent");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">
        Become part of Güney
      </h1>
      <p className="text-faded mt-3">
        Members can post in the community, organise events, share opportunities and see
        the member directory. Whether you live in the village, your family came from it,
        or you&apos;re just drawn to it — you&apos;re welcome.
      </p>

      {state === "sent" ? (
        <div className="mt-8 bg-white rounded-2xl border border-sand p-8 text-center">
          <p className="text-2xl mb-2">📬</p>
          <h2 className="display text-xl font-semibold">Check your email</h2>
          <p className="text-faded text-sm mt-2">
            We sent a sign-in link to <strong className="text-ink">{email}</strong>.
            Open it on this device and you&apos;re in. No password needed — ever.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 bg-white rounded-2xl border border-sand p-6 sm:p-8 space-y-4">
          <label className="block text-sm">
            <span className="font-medium">Your name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="How the village should know you"
              className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Your connection to Güney</span>
            <select value={connection} onChange={(e) => setConnection(e.target.value)}
              className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 bg-white">
              <option value="villager">I live in or near the village</option>
              <option value="diaspora">My family comes from Güney</option>
              <option value="newcomer">I want to move / build something here</option>
              <option value="visitor">I&apos;m visiting or just curious</option>
            </select>
          </label>
          <button disabled={state === "sending"}
            className="w-full py-3 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors cursor-pointer disabled:opacity-60">
            {state === "sending" ? "Sending link…" : "Send me a sign-in link"}
          </button>
          {state === "error" && <p className="text-sm text-red-700">{error}</p>}
          <p className="text-xs text-faded">
            We only ask for what&apos;s necessary. No password, no spam — a sign-in link when you want in.
          </p>
        </form>
      )}
    </div>
  );
}
