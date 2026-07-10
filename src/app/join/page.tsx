"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LanguageProvider";

type Mode = "signin" | "signup";

function OAuthButtons({ onError }: { onError: (m: string) => void }) {
  async function oauth(provider: "google" | "facebook") {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
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
  const { t } = useLang();
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
    window.location.href = "/dashboard";
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) { setError(t("join.err.terms")); setState("error"); return; }
    setState("loading"); setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: { name, connection, phone, notify },
      },
    });
    if (error) { setError(error.message); setState("error"); return; }
    // if confirmation is off, a session comes back immediately
    if (data.session) { window.location.href = "/dashboard"; return; }
    setState("sent");
  }

  async function magicLink() {
    if (!email) { setError(t("join.err.email")); setState("error"); return; }
    setState("loading"); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) { setError(error.message); setState("error"); return; }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <Shell>
        <div className="bg-white rounded-2xl border border-sand p-8 text-center">
          <p className="text-2xl mb-2">📬</p>
          <h2 className="display text-xl font-semibold">{t("join.check.title")}</h2>
          <p className="text-faded text-sm mt-2">
            {t("join.check.pre")}<strong className="text-ink">{email}</strong>{t("join.check.post")}
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* tabs */}
      <div className="flex bg-sand/60 rounded-full p-1 mb-6 text-sm font-medium">
        <button onClick={() => { setMode("signin"); setState("idle"); }}
          className={`flex-1 py-2 rounded-full transition-colors ${mode === "signin" ? "bg-white shadow-sm text-olive-deep" : "text-faded cursor-pointer"}`}>{t("join.tab.signin")}</button>
        <button onClick={() => { setMode("signup"); setState("idle"); }}
          className={`flex-1 py-2 rounded-full transition-colors ${mode === "signup" ? "bg-white shadow-sm text-olive-deep" : "text-faded cursor-pointer"}`}>{t("join.tab.signup")}</button>
      </div>

      <div className="bg-white rounded-2xl border border-sand p-6 sm:p-8">
        <OAuthButtons onError={(m) => { setError(m); setState("error"); }} />
        <div className="flex items-center gap-3 my-5 text-xs text-faded">
          <span className="flex-1 h-px bg-sand" /> {t("join.orwith")} <span className="flex-1 h-px bg-sand" />
        </div>

        {mode === "signin" ? (
          <form onSubmit={signIn} className="space-y-3">
            <Field label={t("join.f.email")}><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} /></Field>
            <Field label={t("join.f.password")}><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} /></Field>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-olive" />
                <span className="text-faded">{t("join.remember")}</span>
              </label>
              <Link href="/auth/forgot" className="text-terra hover:underline">{t("join.forgot")}</Link>
            </div>
            <button disabled={state === "loading"} className={btnCls}>{state === "loading" ? t("join.signin.loading") : t("join.signin")}</button>
            <button type="button" onClick={magicLink} className="w-full text-xs text-faded hover:text-ink py-1">{t("join.magic")}</button>
          </form>
        ) : (
          <form onSubmit={signUp} className="space-y-3">
            <Field label={t("join.f.name")}><input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t("join.f.name.ph")} className={inputCls} /></Field>
            <Field label={t("join.f.email")}><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} /></Field>
            <Field label={t("join.f.password")}><input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("join.f.pw.ph")} className={inputCls} /></Field>
            <Field label={t("join.f.connection")}>
              <select value={connection} onChange={(e) => setConnection(e.target.value)} className={`${inputCls} bg-white`}>
                <option value="villager">{t("join.conn.villager")}</option>
                <option value="diaspora">{t("join.conn.diaspora")}</option>
                <option value="newcomer">{t("join.conn.newcomer")}</option>
                <option value="visitor">{t("join.conn.visitor")}</option>
              </select>
            </Field>
            {/* Phone — highlighted as a real step, not a buried optional */}
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-3.5">
              <label className="block text-sm">
                <span className="flex items-center gap-2 font-medium text-olive-deep">
                  <span className="text-base">📱</span> {t("join.phone.title")}
                </span>
                <span className="block text-[12px] text-faded mt-0.5 mb-2">
                  {t("join.phone.desc")}
                </span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx"
                  className="w-full border border-olive/30 rounded-lg px-3 py-2.5 text-sm bg-white" />
              </label>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-olive mt-0.5" />
                <span className="text-faded">{t("join.agree.pre")}<Link href="/terms" className="text-terra underline">{t("join.terms")}</Link>{t("join.agree.mid")}<Link href="/privacy" className="text-terra underline">{t("join.privacy")}</Link>{t("join.agree.post")}</span>
              </label>
              <label className="flex items-start gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-olive mt-0.5" />
                <span className="text-faded">{t("join.notify")}</span>
              </label>
            </div>

            <button disabled={state === "loading"} className={btnCls}>{state === "loading" ? t("join.create.loading") : t("join.create")}</button>
          </form>
        )}

        {state === "error" && <p className="text-sm text-red-700 mt-3">{error}</p>}
      </div>

      <p className="text-xs text-faded mt-4 text-center">
        {mode === "signin" ? t("join.switch.new") : t("join.switch.member")}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-terra hover:underline cursor-pointer">
          {mode === "signin" ? t("join.switch.create") : t("join.switch.signin")}
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
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="display text-3xl font-semibold text-olive-deep text-center">{t("join.welcome")}</h1>
      <p className="text-faded mt-2 mb-8 text-center text-sm">{t("join.subtitle")}</p>
      {children}
    </div>
  );
}

export default function JoinPage() {
  return <Suspense fallback={<Shell><div /></Shell>}><JoinInner /></Suspense>;
}
