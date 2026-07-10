"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "@/app/actions";
import { useLang } from "@/components/LanguageProvider";
import { langOption } from "@/lib/i18n";
import LanguagePicker from "@/components/LanguagePicker";

const links = [
  { href: "/community", key: "nav.community" },
  { href: "/opportunities", key: "nav.opportunities" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/guide", key: "nav.guide" },
];

export default function Header({ signedIn, name, isAdmin, avatarUrl }: { signedIn: boolean; name: string | null; isAdmin?: boolean; avatarUrl?: string | null }) {
  const { lang, t } = useLang();
  const [menu, setMenu] = useState(false);
  const [acct, setAcct] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const initial = (name?.[0] ?? "").toUpperCase();
  const current = langOption(lang);

  const close = () => { setMenu(false); setAcct(false); };

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-sand">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" onClick={close} className="display text-xl font-semibold text-olive-deep">
          Güney<span className="text-terra">.live</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Hamburger */}
          <div className="relative">
            <button onClick={() => { setMenu((m) => !m); setAcct(false); }} aria-label="Menu"
              className="w-10 h-10 rounded-full hover:bg-sand flex items-center justify-center cursor-pointer">
              <span className="relative block w-5 h-[13px]">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-ink rounded" />
                <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-ink rounded" />
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ink rounded" />
              </span>
            </button>
            {menu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-sand shadow-lg py-1.5 z-40">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} onClick={close}
                    className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors">{t(l.key)}</Link>
                ))}
                {signedIn && (
                  <Link href="/members" onClick={close}
                    className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors border-t border-sand mt-1 pt-2.5">{t("nav.members")}</Link>
                )}
                {/* Language row — current language on the left; opens the full picker */}
                <button
                  onClick={() => { setLangOpen(true); close(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-sand transition-colors border-t border-sand mt-1 pt-2.5 cursor-pointer">
                  <span className="text-base leading-none">{current.flag}</span>
                  <span className="flex-1 text-left">{current.native}</span>
                  <span className="text-faded text-xs">{t("nav.language")} ▾</span>
                </button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            {signedIn ? (
              <button onClick={() => { setAcct((a) => !a); setMenu(false); }} aria-label="Account"
                className="w-9 h-9 rounded-full bg-olive text-cream flex items-center justify-center font-semibold cursor-pointer hover:bg-olive-deep transition-colors overflow-hidden">
                {avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={avatarUrl} alt={name ?? "me"} className="w-full h-full object-cover" />
                  : (initial || "•")}
              </button>
            ) : (
              <Link href="/join" onClick={close} aria-label={t("nav.join")}
                className="w-9 h-9 rounded-full bg-sand hover:bg-sage/50 flex items-center justify-center cursor-pointer transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-faded">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </Link>
            )}
            {signedIn && acct && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-sand shadow-lg py-1.5 z-40">
                <p className="px-4 py-1.5 text-xs text-faded truncate">{name ?? t("nav.members")}</p>
                <Link href="/dashboard" onClick={close} className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors">{t("nav.dashboard")}</Link>
                <Link href="/members" onClick={close} className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors">{t("nav.members")}</Link>
                {isAdmin && (
                  <Link href="/admin" onClick={close} className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors text-olive-deep font-medium">⚙ {t("nav.operations")}</Link>
                )}
                <form action={signOut}>
                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-sand transition-colors cursor-pointer">{t("nav.signout")}</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {(menu || acct) && <button aria-hidden tabIndex={-1} onClick={close} className="fixed inset-0 z-20 cursor-default" />}

      {/* Language picker popup */}
      {langOpen && (
        <div className="fixed inset-0 z-[55] flex items-start sm:items-center justify-center p-4 pt-16 sm:pt-4">
          <button aria-hidden onClick={() => setLangOpen(false)} className="absolute inset-0 bg-ink/40 backdrop-blur-sm cursor-default" />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-sand shadow-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="display text-lg font-semibold text-olive-deep">{t("lang.title")}</h3>
              <button onClick={() => setLangOpen(false)} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-sand flex items-center justify-center cursor-pointer text-faded">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <LanguagePicker columns={2} onPick={() => setLangOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
