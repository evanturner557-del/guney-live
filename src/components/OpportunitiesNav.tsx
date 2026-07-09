"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { NavCard, NavSection, NavRow } from "@/components/SideNav";
import { oppTypeLabel } from "@/components/ui";

const icons: Record<string, string> = {
  land: "🌾", property: "🏠", restoration: "🛠️", business: "💼",
  farm: "🚜", skills: "🎓", volunteer: "🤝", collaboration: "🔗",
};

export default function OpportunitiesNav() {
  const path = usePathname();
  const sp = useSearchParams();
  const type = sp.get("type") ?? "all";
  const active = (v: string) => path === "/opportunities" && type === v;

  return (
    <nav className="md:sticky md:top-20 self-start w-full">
      <NavCard>
        <NavSection icon="🌍" title="Opportunities">
          <NavRow href="/opportunities" icon="✨" label="All" active={active("all")} />
          {Object.entries(oppTypeLabel).map(([v, l]) => (
            <NavRow key={v} href={`/opportunities?type=${v}`} icon={icons[v] ?? "•"} label={l} active={active(v)} />
          ))}
        </NavSection>
      </NavCard>
    </nav>
  );
}
