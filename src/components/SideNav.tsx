import Link from "next/link";

// Shared boxed/lined sidebar primitives — Facebook/WhatsApp/Twitter-style
// left rail: a bordered card, icon-labelled sections, pill-highlighted rows.
// Works from server or client components (no hooks in here).

export function NavCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-sand overflow-hidden divide-y divide-sand">
      {children}
    </div>
  );
}

export function NavSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-faded px-3.5 py-1.5">
        <span className="text-xs">{icon}</span>{title}
      </p>
      <div className="px-1.5 space-y-0.5 pb-1.5">{children}</div>
    </div>
  );
}

export function NavRow({ href, icon, label, active, muted }: {
  href: string; icon: string; label: string; active?: boolean; muted?: boolean;
}) {
  return (
    <Link href={href} aria-disabled={muted}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
        active ? "bg-olive text-cream font-medium shadow-sm"
        : muted ? "text-faded/60 pointer-events-none"
        : "text-ink hover:bg-sand"
      }`}>
      <span className="text-base leading-none w-4 text-center">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function NavAnchor({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-sand transition-colors">
      <span className="text-base leading-none w-4 text-center">{icon}</span>
      <span className="truncate">{label}</span>
    </a>
  );
}
