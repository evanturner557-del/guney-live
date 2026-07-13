"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/community", label: "Feed" },
  { href: "/community/chat", label: "Chat" },
  { href: "/community/marketplace", label: "Marketplace" },
  { href: "/community/opportunities", label: "Opportunities" },
];

export default function CommunityTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 bg-sand/60 rounded-full p-1 overflow-x-auto">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              active ? "bg-white shadow-sm text-olive-deep" : "text-faded hover:text-ink"
            }`}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
