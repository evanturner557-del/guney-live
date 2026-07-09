import { createClient } from "@/lib/supabase/server";
import { Md } from "@/components/ui";
import { NavCard, NavSection, NavAnchor } from "@/components/SideNav";

const catIcon: Record<string, string> = {
  "getting-here": "🧭", staying: "🛏️", living: "🏡", nature: "🌿", services: "☎️", faq: "❓",
};

export const revalidate = 3600;

const catMeta: Record<string, { title: string; blurb: string }> = {
  "getting-here": { title: "Getting here", blurb: "Where Güney is and how to reach it." },
  staying: { title: "Visiting & staying", blurb: "Beds, food, and what to do." },
  living: { title: "Living here", blurb: "Internet, healthcare, schools, property, seasons." },
  nature: { title: "Nature", blurb: "Lake Salda and the landscape around the village." },
  services: { title: "Services & contacts", blurb: "Who to call, how to move around." },
  faq: { title: "Questions", blurb: "The things everyone asks." },
};
const catOrder = ["getting-here", "staying", "living", "nature", "services", "faq"];

export default async function GuidePage() {
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
        <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">The Guide</h1>
        <p className="text-faded mt-2">
          Everything practical about visiting and living in Güney. No marketing — just what&apos;s useful.
          The map reference: the village sits at 37.50° N, 29.55° E, 8 km west of Lake Salda.
        </p>
        <p className="mt-3">
          <a
            href="https://www.google.com/maps/search/?api=1&query=G%C3%BCney%2C+Ye%C5%9Filova%2C+Burdur"
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-terra hover:underline">
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
        </div>
      </div>
    </div>
  );
}
