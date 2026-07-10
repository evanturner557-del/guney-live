"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { NavCard, NavSection, NavRow } from "@/components/SideNav";
import { useLang } from "@/components/LanguageProvider";

const notices = [
  { key: "community.everything", icon: "🗂️", href: "/community" },
  { key: "community.h.update", icon: "📰", href: "/community?type=update" },
  { key: "community.h.event", icon: "📅", href: "/community?type=event" },
  { key: "community.h.notice", icon: "📌", href: "/community?type=notice" },
  { key: "community.h.help", icon: "🆘", href: "/community?type=help" },
];

export default function CommunityNav() {
  const { t } = useLang();
  const path = usePathname();
  const sp = useSearchParams();
  const type = sp.get("type");

  const isNotices = path === "/community";
  const activeNotice = (href: string) => {
    const seg = href.includes("type=") ? href.split("type=")[1] : null;
    return isNotices && (type ?? null) === seg;
  };

  return (
    <nav className="md:sticky md:top-20 self-start w-full">
      <NavCard>
        <NavSection icon="📣" title={t("community.h.all")}>
          {notices.map((n) => (
            <NavRow key={n.href} href={n.href} icon={n.icon} label={t(n.key)} active={activeNotice(n.href)} />
          ))}
        </NavSection>
        <NavSection icon="📍" title={t("community.places")}>
          <NavRow href="/community/marketplace" icon="🛒" label={t("community.marketplace")} active={path.startsWith("/community/marketplace")} />
          <NavRow href="/community/chat" icon="💬" label={t("community.townsquare")} active={path.startsWith("/community/chat")} />
          <NavRow href="#" icon="✉️" label={t("community.dm")} muted />
        </NavSection>
      </NavCard>
    </nav>
  );
}
