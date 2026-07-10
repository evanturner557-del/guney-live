"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { NavCard, NavSection, NavRow } from "@/components/SideNav";
import { oppTypeLabel } from "@/components/ui";
import { useLang } from "@/components/LanguageProvider";

const icons: Record<string, string> = {
  land: "🌾", property: "🏠", restoration: "🛠️", business: "💼",
  farm: "🚜", skills: "🎓", volunteer: "🤝", collaboration: "🔗",
};

export default function OpportunitiesNav() {
  const { t } = useLang();
  const path = usePathname();
  const sp = useSearchParams();
  const type = sp.get("type") ?? "all";
  const active = (v: string) => path === "/opportunities" && type === v;

  return (
    <nav className="md:sticky md:top-20 self-start w-full">
      <NavCard>
        <NavSection icon="🌍" title={t("opp.title")}>
          <NavRow href="/opportunities" icon="✨" label={t("opp.all")} active={active("all")} />
          {Object.keys(oppTypeLabel).map((v) => (
            <NavRow key={v} href={`/opportunities?type=${v}`} icon={icons[v] ?? "•"} label={t(`opp.type.${v}`)} active={active(v)} />
          ))}
        </NavSection>
      </NavCard>
    </nav>
  );
}
