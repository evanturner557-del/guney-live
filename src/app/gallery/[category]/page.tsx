import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Gallery, { type Photo } from "@/components/Gallery";
import PhotoUpload from "@/components/PhotoUpload";
import VillageMap from "@/components/VillageMap";
import { catByKey, CATEGORIES } from "@/lib/categories";
import { poisByCat } from "@/lib/pois";
import { getServerLang } from "@/lib/lang-server";
import { makeT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.key }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = catByKey(category);
  if (!cat) notFound();
  const pois = poisByCat(category);

  const lang = await getServerLang();
  const t = makeT(lang);
  const catName = t(`gallery.cat.${cat.key}.name`);
  const catBlurb = t(`gallery.cat.${cat.key}.blurb`);

  const supabase = await createClient();
  const [{ data: { user } }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("photos").select("*").eq("category", category).order("created_at", { ascending: false }),
  ]);
  const photos = (data ?? []) as Photo[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/gallery" className="text-sm text-terra hover:underline">{t("gallery.back")}</Link>
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep mt-3">{cat.emoji} {catName}</h1>
      <p className="text-faded mt-2 max-w-2xl">{catBlurb}</p>

      {pois.length > 0 && (
        <div className="mt-6">
          <VillageMap pois={pois} center={[pois[0].lat, pois[0].lng]} zoom={12} height={240} controls={false} />
          <p className="text-xs text-faded mt-1.5">{t("gallery.onmap.pre")}{pois.map((p) => `${p.emoji} ${p.name}`).join(" · ")}{t("gallery.onmap.post")}</p>
        </div>
      )}

      {user ? (
        <div className="mt-6"><PhotoUpload userId={user.id} category={cat.key} /></div>
      ) : (
        <p className="mt-6 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">{t("gallery.join.link")}</Link>
          {t("gallery.join.rest").replace("{x}", catName)}
        </p>
      )}

      <div className="mt-8">
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-sand/40 rounded-2xl">
            <p className="text-4xl mb-2">{cat.emoji}</p>
            <p className="font-medium text-olive-deep">{t("gallery.empty.title")}</p>
            <p className="text-sm text-faded mt-1 max-w-md mx-auto">
              {t("gallery.empty.body").replace("{x}", lang === "en" ? catName.toLowerCase() : catName)}
              {user ? t("gallery.empty.add") : t("gallery.empty.join")}
            </p>
          </div>
        ) : (
          <Gallery photos={photos} />
        )}
      </div>
    </div>
  );
}
