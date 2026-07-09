import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guney.live — the digital home of Güney village",
  description:
    "The community platform for Güney (Yeşilova, Burdur, Turkey). What's happening, who needs help, what you can build — 8 km from Lake Salda.",
};

const nav = [
  { href: "/community", label: "Community" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/guide", label: "Guide" },
];

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-cream/90 backdrop-blur border-b border-sand">
          <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="display text-xl font-semibold text-olive-deep">
              Güney<span className="text-terra">.live</span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href}
                  className="px-2 py-1 rounded hover:bg-sand transition-colors">
                  {n.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href="/members" className="px-2 py-1 rounded hover:bg-sand transition-colors">
                    Members
                  </Link>
                  <form action={signOut}>
                    <button className="px-3 py-1.5 rounded-full border border-sand text-faded hover:text-ink cursor-pointer">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/join"
                  className="px-3 py-1.5 rounded-full bg-olive text-cream hover:bg-olive-deep transition-colors">
                  Join
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-sand mt-16">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-faded flex flex-wrap gap-4 justify-between">
            <p>Güney, Yeşilova, Burdur — the village, online.</p>
            <p>Built by the community, for the community.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
