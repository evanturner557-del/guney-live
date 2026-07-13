"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";

const links = [
  { href: "/guide", label: "Guide" },
  { href: "/community", label: "Community" },
  { href: "/join", label: "Join" },
];

export default function Header({ signedIn, name, isAdmin, avatarUrl }: { signedIn: boolean; name: string | null; isAdmin?: boolean; avatarUrl?: string | null }) {
  const pathname = usePathname();
  const [acct, setAcct] = useState(false);
  const initial = (name?.[0] ?? "").toUpperCase();
  const close = () => setAcct(false);

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-sand">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" onClick={close} className="display text-xl font-semibold text-olive-deep shrink-0">
          Güney<span className="text-terra">.live</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-olive text-cream" : "text-ink hover:bg-sand"
                }`}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            {signedIn ? (
              <button onClick={() => setAcct((a) => !a)} aria-label="Account"
                className="w-9 h-9 rounded-full bg-olive text-cream flex items-center justify-center font-semibold cursor-pointer hover:bg-olive-deep transition-colors overflow-hidden">
                {avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={avatarUrl} alt={name ?? "me"} className="w-full h-full object-cover" />
                  : (initial || "•")}
              </button>
            ) : (
              <Link href="/join" onClick={close} aria-label="Join"
                className="px-4 py-2 rounded-full bg-terra text-cream text-sm font-medium hover:bg-terra-deep transition-colors">
                Join
              </Link>
            )}
            {signedIn && acct && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-sand shadow-lg py-1.5 z-40">
                <p className="px-4 py-1.5 text-xs text-faded truncate">{name ?? "Member"}</p>
                <Link href="/join" onClick={close} className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors">My account</Link>
                {isAdmin && (
                  <Link href="/admin" onClick={close} className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors text-olive-deep font-medium">⚙ Operations</Link>
                )}
                <form action={signOut}>
                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-sand transition-colors cursor-pointer">Sign out</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mobile nav row */}
      <nav className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                active ? "bg-olive text-cream" : "text-ink hover:bg-sand"
              }`}>
              {l.label}
            </Link>
          );
        })}
      </nav>

      {acct && <button aria-hidden tabIndex={-1} onClick={close} className="fixed inset-0 z-20 cursor-default" />}
    </header>
  );
}
