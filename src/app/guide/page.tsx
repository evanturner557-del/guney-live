import { createClient } from "@/lib/supabase/server";
import { Md } from "@/components/ui";
import { NavCard, NavSection, NavAnchor } from "@/components/SideNav";
import { getServerLang } from "@/lib/lang-server";
import { makeT } from "@/lib/i18n";

const catIcon: Record<string, string> = {
  "getting-here": "🧭", staying: "🛏️", living: "🏡", nature: "🌿", services: "☎️", faq: "❓",
};

export const revalidate = 3600;

const catOrder = ["getting-here", "staying", "living", "nature", "services", "faq"];

export default async function GuidePage() {
  const t = makeT(await getServerLang());
  const supabase = await createClient();
  const { data } = await supabase.from("guide_articles").select("*")
    .order("category").order("sort");
  const articles = data ?? [];
  const byCat = catOrder
    .map((c) => ({ cat: c, items: articles.filter((a) => a.category === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">{t("guide.title")}</h1>
        <p className="text-faded mt-2">
          {t("guide.intro")}
        </p>
        <p className="mt-3">
          <a
            href="https://www.google.com/maps/search/?api=1&query=G%C3%BCney%2C+Ye%C5%9Filova%2C+Burdur"
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-terra hover:underline">
            {t("guide.maps")}
          </a>
        </p>
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-6 mt-10">
        <nav className="hidden md:block sticky top-20 self-start w-full">
          <NavCard>
            <NavSection icon="📖" title={t("guide.title")}>
              {byCat.map((g) => (
                <NavAnchor key={g.cat} href={`#${g.cat}`} icon={catIcon[g.cat] ?? "•"} label={t(`guide.cat.${g.cat}.title`)} />
              ))}
            </NavSection>
          </NavCard>
        </nav>

        <div className="space-y-12 max-w-2xl">
          {byCat.map((g) => (
            <section key={g.cat} id={g.cat} className="scroll-mt-20">
              <h2 className="display text-2xl font-semibold text-olive-deep">{t(`guide.cat.${g.cat}.title`)}</h2>
              <p className="text-sm text-faded mb-4">{t(`guide.cat.${g.cat}.blurb`)}</p>
              <div className="space-y-3">
                {g.items.map((a) => (
                  <details key={a.id} className="bg-white rounded-xl border border-sand" open={g.items.length === 1}>
                    <summary className="cursor-pointer px-5 py-4 font-medium select-none">{a.title}</summary>
                    <div className="px-5 pb-5"><Md>{a.body}</Md></div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
