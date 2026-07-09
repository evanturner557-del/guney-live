"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "@/app/actions";

const links = [
  { href: "/community", label: "Community" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/guide", label: "Guide" },
];

export default function Header({ signedIn, name }: { signedIn: boolean; name: string | null }) {
  const [menu, setMenu] = useState(false);
  const [acct, setAcct] = useState(false);
  const initial = (name?.[0] ?? "").toUpperCase();

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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-sand shadow-lg py-1.5 z-40">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} onClick={close}
                    className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors">{l.label}</Link>
                ))}
                {signedIn && (
                  <Link href="/members" onClick={close}
                    className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors border-t border-sand mt-1 pt-2.5">Members</Link>
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            {signedIn ? (
              <button onClick={() => { setAcct((a) => !a); setMenu(false); }} aria-label="Account"
                className="w-9 h-9 rounded-full bg-olive text-cream flex items-center justify-center font-semibold cursor-pointer hover:bg-olive-deep transition-colors">
                {initial || "•"}
              </button>
            ) : (
              <Link href="/join" onClick={close} aria-label="Join"
                className="w-9 h-9 rounded-full bg-sand hover:bg-sage/50 flex items-center justify-center cursor-pointer transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-faded">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </Link>
            )}
            {signedIn && acct && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-sand shadow-lg py-1.5 z-40">
                <p className="px-4 py-1.5 text-xs text-faded truncate">{name ?? "Member"}</p>
                <Link href="/members" onClick={close} className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors">My profile</Link>
                <form action={signOut}>
                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-sand transition-colors cursor-pointer">Sign out</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {(menu || acct) && <button aria-hidden tabIndex={-1} onClick={close} className="fixed inset-0 z-20 cursor-default" />}
    </header>
  );
}
