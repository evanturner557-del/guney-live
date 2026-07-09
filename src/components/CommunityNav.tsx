"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { NavCard, NavSection, NavRow } from "@/components/SideNav";

const notices = [
  { label: "Everything", icon: "🗂️", href: "/community" },
  { label: "Updates", icon: "📰", href: "/community?type=update" },
  { label: "Events", icon: "📅", href: "/community?type=event" },
  { label: "Notices", icon: "📌", href: "/community?type=notice" },
  { label: "Help needed", icon: "🆘", href: "/community?type=help" },
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

  return (
    <nav className="md:sticky md:top-20 self-start w-full">
      <NavCard>
        <NavSection icon="📣" title="Public notices">
          {notices.map((n) => (
            <NavRow key={n.href} href={n.href} icon={n.icon} label={n.label} active={activeNotice(n.href)} />
          ))}
        </NavSection>
        <NavSection icon="📍" title="Places">
          <NavRow href="/community/marketplace" icon="🛒" label="Marketplace" active={path.startsWith("/community/marketplace")} />
          <NavRow href="/community/chat" icon="💬" label="Town Square" active={path.startsWith("/community/chat")} />
          <NavRow href="#" icon="✉️" label="Direct messages · soon" muted />
        </NavSection>
      </NavCard>
    </nav>
  );
}
