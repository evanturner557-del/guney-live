"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

function OAuthButtons({ onError }: { onError: (m: string) => void }) {
  async function oauth(provider: "google" | "facebook") {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/community` },
    });
    if (error) onError(error.message);
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={() => oauth("google")}
        className="flex items-center justify-center gap-2 border border-sand rounded-full py-2.5 text-sm font-medium hover:bg-sand transition-colors cursor-pointer">
        <span className="text-base">🇬</span> Google
      </button>
      <button type="button" onClick={() => oauth("facebook")}
        className="flex items-center justify-center gap-2 border border-sand rounded-full py-2.5 text-sm font-medium hover:bg-sand transition-colors cursor-pointer">
        <span className="text-base">f</span> Facebook
      </button>
    </div>
  );
}

function JoinInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [connection, setConnection] = useState("newcomer");
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(false);
  const [notify, setNotify] = useState(true);
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setState("loading"); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setState("error"); return; }
    window.location.href = "/community";
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) { setError("Please accept the terms and cookie policy to continue."); setState("error"); return; }
    setState("loading"); setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/community`,
        data: { name, connection, phone, notify },
      },
    });
    if (error) { setError(error.message); setState("error"); return; }
    if (data.session) { window.location.href = "/community"; return; }
    setState("sent");
  }

  async function magicLink() {
    if (!email) { setError("Enter your email first."); setState("error"); return; }
    setState("loading"); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/community` },
    });
    if (error) { setError(error.message); setState("error"); return; }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <Shell>
        <div className="bg-white rounded-2xl border border-sand p-8 text-center">
          <p className="text-2xl mb-2">📬</p>
          <h2 className="display text-xl font-semibold">Check your email</h2>
          <p className="text-faded text-sm mt-2">
            We sent a message to <strong className="text-ink">{email}</strong>. Open it on this device to finish.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex bg-sand/60 rounded-full p-1 mb-6 text-sm font-medium">
        <button onClick={() => { setMode("signin"); setState("idle"); }}
          className={`flex-1 py-2 rounded-full transition-colors ${mode === "signin" ? "bg-white shadow-sm text-olive-deep" : "text-faded cursor-pointer"}`}>Sign in</button>
        <button onClick={() => { setMode("signup"); setState("idle"); }}
          className={`flex-1 py-2 rounded-full transition-colors ${mode === "signup" ? "bg-white shadow-sm text-olive-deep" : "text-faded cursor-pointer"}`}>Create account</button>
      </div>

      <div className="bg-white rounded-2xl border border-sand p-6 sm:p-8">
        <OAuthButtons onError={(m) => { setError(m); setState("error"); }} />
        <div className="flex items-center gap-3 my-5 text-xs text-faded">
          <span className="flex-1 h-px bg-sand" /> or with email <span className="flex-1 h-px bg-sand" />
        </div>

        {mode === "signin" ? (
          <form onSubmit={signIn} className="space-y-3">
            <Field label="Email"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} /></Field>
            <Field label="Password"><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} /></Field>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-olive" />
                <span className="text-faded">Keep me signed in</span>
              </label>
              <Link href="/auth/forgot" className="text-terra hover:underline">Forgot password?</Link>
            </div>
            <button disabled={state === "loading"} className={btnCls}>{state === "loading" ? "Signing in…" : "Sign in"}</button>
            <button type="button" onClick={magicLink} className="w-full text-xs text-faded hover:text-ink py-1">or email me a one-time sign-in link instead</button>
          </form>
        ) : (
          <form onSubmit={signUp} className="space-y-3">
            <Field label="Your name"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="How the village should know you" className={inputCls} /></Field>
            <Field label="Email"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} /></Field>
            <Field label="Password"><input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputCls} /></Field>
            <Field label="Your connection to Güney">
              <select value={connection} onChange={(e) => setConnection(e.target.value)} className={`${inputCls} bg-white`}>
                <option value="villager">I live in or near the village</option>
                <option value="diaspora">My family comes from Güney</option>
                <option value="newcomer">I want to move / build something here</option>
                <option value="visitor">I&apos;m visiting or just curious</option>
              </select>
            </Field>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-3.5">
              <label className="block text-sm">
                <span className="flex items-center gap-2 font-medium text-olive-deep">
                  <span className="text-base">📱</span> Phone (optional — for direct messages later)
                </span>
                <span className="block text-[12px] text-faded mt-0.5 mb-2">Only used for village contact, never shown publicly.</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx"
                  className="w-full border border-olive/30 rounded-lg px-3 py-2.5 text-sm bg-white" />
              </label>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-olive mt-0.5" />
                <span className="text-faded">I agree to the <Link href="/terms" className="text-terra underline">terms</Link> and <Link href="/privacy" className="text-terra underline">privacy policy</Link>, and the use of cookies to keep me signed in.</span>
              </label>
              <label className="flex items-start gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-olive mt-0.5" />
                <span className="text-faded">Email me about village news and replies (you can turn this off anytime).</span>
              </label>
            </div>

            <button disabled={state === "loading"} className={btnCls}>{state === "loading" ? "Creating…" : "Create account"}</button>
          </form>
        )}

        {state === "error" && <p className="text-sm text-red-700 mt-3">{error}</p>}
      </div>

      <p className="text-xs text-faded mt-4 text-center">
        {mode === "signin" ? "New to Güney? " : "Already a member? "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-terra hover:underline cursor-pointer">
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </Shell>
  );
}

const inputCls = "mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm";
const btnCls = "w-full py-3 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors cursor-pointer disabled:opacity-60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="font-medium">{label}</span>{children}</label>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="display text-3xl font-semibold text-olive-deep text-center">Welcome to Güney</h1>
      <p className="text-faded mt-2 mb-8 text-center text-sm">The village, online — for those who live here, come from here, or are drawn to it.</p>
      {children}
    </div>
  );
}

export default function JoinForm() {
  return <Suspense fallback={<Shell><div /></Shell>}><JoinInner /></Suspense>;
}
