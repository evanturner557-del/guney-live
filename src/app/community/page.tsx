import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "@/app/actions";
import { PostCard, type Post } from "@/components/ui";
import { getServerLang } from "@/lib/lang-server";
import { makeT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const filters = ["all", "update", "event", "notice", "help"] as const;

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const t = makeT(await getServerLang());
  const { type } = await searchParams;
  const active = filters.includes((type ?? "all") as (typeof filters)[number]) ? (type ?? "all") : "all";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let q = supabase.from("posts").select("*, profiles(name)")
    .order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(50);
  if (active !== "all") q = q.eq("type", active);
  const { data } = await q;
  const posts = (data ?? []) as Post[];

  return (
    <div>
      <h1 className="display text-2xl sm:text-3xl font-semibold text-olive-deep">{t(`community.h.${active}`)}</h1>
      <p className="text-faded mt-1 text-sm">{t("community.intro")}</p>

      {user ? (
        <details className="mt-5 bg-white rounded-xl border border-sand">
          <summary className="cursor-pointer px-5 py-4 font-medium text-olive-deep select-none">{t("community.share")}</summary>
          <form action={createPost} className="px-5 pb-5 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <select name="type" className="border border-sand rounded-lg px-3 py-2 text-sm bg-cream" defaultValue={active === "all" ? "update" : active}>
                <option value="update">{t("community.type.update")}</option><option value="event">{t("community.type.event")}</option>
                <option value="notice">{t("community.type.notice")}</option><option value="help">{t("community.type.help")}</option>
              </select>
              <input name="title" required placeholder={t("community.f.title")} maxLength={120} className="flex-1 min-w-48 border border-sand rounded-lg px-3 py-2 text-sm" />
            </div>
            <textarea name="body" required rows={4} placeholder={t("community.f.body")} className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-3 flex-wrap text-sm">
              <label className="flex items-center gap-2 text-faded">{t("community.f.eventdate")} <input type="datetime-local" name="event_date" className="border border-sand rounded-lg px-2 py-1.5" /></label>
              <input name="event_location" placeholder={t("community.f.eventloc")} className="border border-sand rounded-lg px-3 py-1.5 flex-1 min-w-40" />
            </div>
            <button className="px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">{t("community.f.post")}</button>
          </form>
        </details>
      ) : (
        <p className="mt-5 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">{t("community.join.link")}</Link>{t("community.join.rest")}
        </p>
      )}

      <div className="space-y-3 mt-6">
        {posts.length === 0 && <p className="text-faded text-sm py-8">{t("community.empty").replace("{x}", active === "all" ? t("community.here") : t(`community.type.${active}`))}</p>}
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
