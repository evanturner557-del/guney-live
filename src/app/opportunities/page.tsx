import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createOpportunity } from "@/app/actions";
import { Md, oppTypeLabel } from "@/components/ui";
import { getServerLang } from "@/lib/lang-server";
import { makeT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const t = makeT(await getServerLang());
  const { type } = await searchParams;
  const active = type && oppTypeLabel[type] ? type : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let q = supabase.from("opportunities").select("*")
    .neq("status", "closed").order("created_at", { ascending: false });
  if (active !== "all") q = q.eq("type", active);
  const { data: opps } = await q;

  return (
    <div className="max-w-2xl">
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">{t("opp.title")}</h1>
      <p className="text-faded mt-2">
        {t("opp.intro")}
      </p>

      {user ? (
        <details className="mt-6 bg-white rounded-xl border border-sand">
          <summary className="cursor-pointer px-5 py-4 font-medium text-olive-deep select-none">
            {t("opp.post")}
          </summary>
          <form action={createOpportunity} className="px-5 pb-5 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <select name="type" className="border border-sand rounded-lg px-3 py-2 text-sm bg-cream" defaultValue="collaboration">
                {Object.keys(oppTypeLabel).map((v) => (
                  <option key={v} value={v}>{t(`opp.type.${v}`)}</option>
                ))}
              </select>
              <input name="title" required placeholder={t("opp.f.title")} maxLength={120}
                className="flex-1 min-w-48 border border-sand rounded-lg px-3 py-2 text-sm" />
            </div>
            <input name="summary" required placeholder={t("opp.f.summary")} maxLength={200}
              className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <textarea name="details" rows={4} placeholder={t("opp.f.details")}
              className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <input name="contact" placeholder={t("opp.f.contact")}
              className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <button className="px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">
              {t("opp.f.submit")}
            </button>
          </form>
        </details>
      ) : (
        <p className="mt-6 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">{t("opp.join.link")}</Link>
          {t("opp.join.rest")}
        </p>
      )}

      <div className="space-y-4 mt-8">
        {(opps ?? []).length === 0 && <p className="text-faded text-sm py-8">{t("opp.empty")}</p>}
        {(opps ?? []).map((o) => (
          <details key={o.id} className="bg-white rounded-xl border border-sand group">
            <summary className="cursor-pointer p-5 select-none list-none">
              <span className="text-xs font-medium text-terra-deep">{oppTypeLabel[o.type] ? t(`opp.type.${o.type}`) : o.type}</span>
              {o.status === "in_progress" && (
                <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-sage/30 text-olive-deep">{t("opp.inprogress")}</span>
              )}
              <h3 className="font-semibold text-lg leading-snug mt-1">{o.title}</h3>
              <p className="text-[15px] text-faded mt-1">{o.summary}</p>
              <p className="text-xs text-terra mt-2 group-open:hidden">{t("opp.readmore")}</p>
            </summary>
            <div className="px-5 pb-5 border-t border-sand pt-4">
              {o.details && <Md>{o.details}</Md>}
              {o.contact && <p className="text-sm mt-2"><strong>{t("opp.contact")}</strong> {o.contact}</p>}
              {!o.contact && (
                <p className="text-sm text-faded mt-2">
                  {t("opp.interested.pre")}<Link href="/community" className="text-terra hover:underline">{t("opp.interested.link")}</Link>{t("opp.interested.post")}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
