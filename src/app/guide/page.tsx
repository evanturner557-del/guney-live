import { createClient } from "@/lib/supabase/server";
import { Md, PageHeader } from "@/components/ui";
import { NavCard, NavSection, NavAnchor } from "@/components/SideNav";
import CategoryCovers, { type CatStat } from "@/components/CategoryCovers";
import { CATEGORIES } from "@/lib/categories";

const catIcon: Record<string, string> = {
  "getting-here": "🧭", staying: "🛏️", living: "🏡", nature: "🌿", services: "☎️", faq: "❓",
};
const catMeta: Record<string, { title: string; blurb: string }> = {
  "getting-here": { title: "Getting here", blurb: "Where Güney is and how to reach it." },
  staying: { title: "Visiting & staying", blurb: "Beds, food, and what to do." },
  living: { title: "Living here", blurb: "Internet, healthcare, schools, property, seasons." },
  nature: { title: "Nature", blurb: "Lake Salda and the landscape around the village." },
  services: { title: "Services & contacts", blurb: "Who to call, how to move around." },
  faq: { title: "Questions", blurb: "The things everyone asks." },
};
const catOrder = ["getting-here", "staying", "living", "nature", "services", "faq"];

export const revalidate = 3600;

export default async function GuidePage() {
  const supabase = await createClient();
  const [{ data: articleRows }, { data: photoRows }] = await Promise.all([
    supabase.from("guide_articles").select("*").order("category").order("sort"),
    supabase.from("photos").select("category, url, created_at").order("created_at", { ascending: false }),
  ]);
  const articles = articleRows ?? [];
  const byCat = catOrder
    .map((c) => ({ cat: c, items: articles.filter((a) => a.category === c) }))
    .filter((g) => g.items.length > 0);

  const stats: Record<string, CatStat> = {};
  for (const c of CATEGORIES) stats[c.key] = { count: 0, cover: null };
  for (const r of photoRows ?? []) {
    const k = (r.category as string) ?? "village";
    if (!stats[k]) stats[k] = { count: 0, cover: null };
    stats[k].count += 1;
    if (!stats[k].cover) stats[k].cover = r.url as string;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="max-w-2xl">
        <PageHeader title="The Guide" subtitle="Everything practical about visiting and living in Güney, and the village in pictures — no marketing, just what's useful." />
        <p className="mt-3">
          <a href="https://www.google.com/maps/search/?api=1&query=G%C3%BCney%2C+Ye%C5%9Filova%2C+Burdur" target="_blank" rel="noopener noreferrer" className="text-sm text-terra hover:underline">
            Open Güney in Google Maps →
          </a>
        </p>
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-6 mt-10">
        <nav className="hidden md:block sticky top-20 self-start w-full">
          <NavCard>
            <NavSection icon="📖" title="Guide">
              {byCat.map((g) => (
                <NavAnchor key={g.cat} href={`#${g.cat}`} icon={catIcon[g.cat] ?? "•"} label={catMeta[g.cat].title} />
              ))}
            </NavSection>
            <NavSection icon="🖼️" title="Photos">
              <NavAnchor href="#photos" icon="📷" label="The village in pictures" />
            </NavSection>
          </NavCard>
        </nav>

        <div className="space-y-12 max-w-2xl">
          {byCat.map((g) => (
            <section key={g.cat} id={g.cat} className="scroll-mt-20">
              <h2 className="display text-2xl font-semibold text-olive-deep">{catMeta[g.cat].title}</h2>
              <p className="text-sm text-faded mb-4">{catMeta[g.cat].blurb}</p>
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

          <section id="photos" className="scroll-mt-20">
            <h2 className="display text-2xl font-semibold text-olive-deep">The village in pictures</h2>
            <p className="text-sm text-faded mb-4">Güney and Lake Salda, by place. Tap a category to look inside, or open it and add your own.</p>
            <CategoryCovers stats={stats} />
          </section>
        </div>
      </div>
    </div>
  );
}
