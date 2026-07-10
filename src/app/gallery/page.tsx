import { createClient } from "@/lib/supabase/server";
import CategoryCovers, { type CatStat } from "@/components/CategoryCovers";
import { CATEGORIES } from "@/lib/categories";
import { getServerLang } from "@/lib/lang-server";
import { makeT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const t = makeT(await getServerLang());
  const supabase = await createClient();
  const { data } = await supabase.from("photos").select("category, url, created_at").order("created_at", { ascending: false });
  const rows = data ?? [];

  const stats: Record<string, CatStat> = {};
  for (const c of CATEGORIES) stats[c.key] = { count: 0, cover: null };
  for (const r of rows) {
    const k = r.category ?? "village";
    if (!stats[k]) stats[k] = { count: 0, cover: null };
    stats[k].count += 1;
    if (!stats[k].cover) stats[k].cover = r.url; // newest photo = cover
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">{t("gallery.title")}</h1>
      <p className="text-faded mt-2 max-w-2xl">
        {t("gallery.intro")}
      </p>
      <div className="mt-8">
        <CategoryCovers stats={stats} t={t} />
      </div>
    </div>
  );
}
