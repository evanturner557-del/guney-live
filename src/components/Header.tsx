"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";

const links = [
  { href: "/guide", label: "Discover" },
  { href: "/community", label: "Community" },
  { href: "/community/opportunities", label: "Opportunities" },
];

function isActive(pathname: string, href: string) {
  if (href === "/community") return pathname === "/community" || (pathname.startsWith("/community/") && !pathname.startsWith("/community/opportunities"));
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({ signedIn, name, isAdmin, avatarUrl }: { signedIn: boolean; name: string | null; isAdmin?: boolean; avatarUrl?: string | null }) {
  const pathname = usePathname();
  const [acct, setAcct] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const initial = (name?.[0] ?? "").toUpperCase();
  const close = () => setAcct(false);

  // On the homepage the header floats transparent over the photography
  // until the page scrolls; everywhere else it is always solid.
  const overHero = pathname === "/" && !scrolled;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls = (active: boolean) =>
    `px-3 py-2 text-sm transition-colors underline-offset-8 ${
      overHero
        ? active ? "text-cream underline decoration-cream/60" : "text-cream/80 hover:text-cream"
        : active ? "text-ink underline decoration-terra" : "text-faded hover:text-ink"
    }`;

  return (
    <header className={`sticky top-0 z-30 transition-colors duration-300 ${overHero ? "bg-transparent" : "bg-cream/85 backdrop-blur"}`}>
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" onClick={close} className={`display text-lg font-medium shrink-0 transition-colors ${overHero ? "text-cream" : "text-olive-deep"}`}>
          Güney<span className={overHero ? "text-cream/60" : "text-terra"}>.live</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls(isActive(pathname, l.href))}>
              {l.label}
            </Link>
          ))}
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
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  overHero ? "bg-cream/15 text-cream hover:bg-cream/25 backdrop-blur" : "bg-terra text-cream hover:bg-terra-deep"
                }`}>
                Join
              </Link>
            )}
            {signedIn && acct && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-1.5 z-40">
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
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`${linkCls(isActive(pathname, l.href))} whitespace-nowrap`}>
            {l.label}
          </Link>
        ))}
      </nav>

      {acct && <button aria-hidden tabIndex={-1} onClick={close} className="fixed inset-0 z-20 cursor-default" />}
    </header>
  );
}
