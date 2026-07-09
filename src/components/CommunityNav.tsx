"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const notices = [
  { label: "Everything", href: "/community" },
  { label: "Updates", href: "/community?type=update" },
  { label: "Events", href: "/community?type=event" },
  { label: "Notices", href: "/community?type=notice" },
  { label: "Help needed", href: "/community?type=help" },
];

export default function CommunityNav() {
  const path = usePathname();
  const sp = useSearchParams();
  const type = sp.get("type");

  const isNotices = path === "/community";
  const activeNotice = (href: string) => {
    const t = href.includes("type=") ? href.split("type=")[1] : null;
    return isNotices && (type ?? null) === t;
  };

  const Section = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[11px] uppercase tracking-wide text-faded px-3 mt-4 mb-1">{children}</p>
  );
  const cls = (on: boolean) =>
    `block px-3 py-2 rounded-lg text-sm transition-colors ${on ? "bg-olive text-cream" : "hover:bg-sand text-ink"}`;

  return (
    <nav className="md:sticky md:top-20 self-start">
      {/* mobile: horizontal scroll */}
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        <Section>Public notices</Section>
        {notices.map((n) => (
          <Link key={n.href} href={n.href} className={`${cls(activeNotice(n.href))} whitespace-nowrap`}>
            {n.label}
          </Link>
        ))}
        <Section>Places</Section>
        <Link href="/community/marketplace" className={`${cls(path.startsWith("/community/marketplace"))} whitespace-nowrap`}>🛒 Marketplace</Link>
        <Link href="/community/chat" className={`${cls(path.startsWith("/community/chat"))} whitespace-nowrap`}>💬 Town Square</Link>
        <span className="px-3 py-2 rounded-lg text-sm text-faded whitespace-nowrap opacity-60">✉️ Direct messages · soon</span>
      </div>
    </nav>
  );
}
