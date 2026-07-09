import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createListing } from "@/app/actions";
import { timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

const kindLabel: Record<string, string> = {
  sale: "For sale", wanted: "Wanted", free: "Free", rent: "To rent", service: "Service",
};
const kindCls: Record<string, string> = {
  sale: "bg-olive/15 text-olive-deep", wanted: "bg-amber-100 text-amber-800",
  free: "bg-sage/30 text-olive-deep", rent: "bg-terra/15 text-terra-deep", service: "bg-purple-100 text-purple-800",
};

type Listing = {
  id: string; kind: string; title: string; description: string | null;
  price: number | null; currency: string; contact: string | null;
  seller_name: string | null; created_at: string;
};

export default async function MarketplacePage() {
  const supabase = await createClient();
  const [{ data: { user } }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(60),
  ]);
  const listings = (data ?? []) as Listing[];

  return (
    <div>
      <h1 className="display text-2xl sm:text-3xl font-semibold text-olive-deep">Marketplace</h1>
      <p className="text-faded mt-1 text-sm">Buy, sell, rent, give away, or offer a service — between neighbours.</p>

      {user ? (
        <details className="mt-5 bg-white rounded-xl border border-sand">
          <summary className="cursor-pointer px-5 py-4 font-medium text-olive-deep select-none">＋ Post a listing</summary>
          <form action={createListing} className="px-5 pb-5 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <select name="kind" defaultValue="sale" className="border border-sand rounded-lg px-3 py-2 text-sm bg-cream">
                {Object.entries(kindLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input name="title" required placeholder="What is it?" maxLength={120} className="flex-1 min-w-48 border border-sand rounded-lg px-3 py-2 text-sm" />
              <input name="price" type="number" step="any" placeholder="Price ₺ (optional)" className="w-36 border border-sand rounded-lg px-3 py-2 text-sm" />
            </div>
            <textarea name="description" rows={3} placeholder="Details" className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <input name="contact" placeholder="How to reach you (phone, or 'message me in Town Square')" className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <button className="px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">Post listing</button>
          </form>
        </details>
      ) : (
        <p className="mt-5 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">Join</Link> to buy and sell.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        {listings.length === 0 && <p className="text-faded text-sm py-8">No listings yet — post the first.</p>}
        {listings.map((l) => (
          <div key={l.id} className="bg-white rounded-xl border border-sand p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kindCls[l.kind] ?? ""}`}>{kindLabel[l.kind] ?? l.kind}</span>
              {l.price != null && <span className="font-semibold text-olive-deep">₺{Number(l.price).toLocaleString("en-GB")}</span>}
              <span className="text-xs text-faded ml-auto">{timeAgo(l.created_at)}</span>
            </div>
            <h3 className="font-semibold leading-snug">{l.title}</h3>
            {l.description && <p className="text-sm text-faded mt-1 line-clamp-3">{l.description}</p>}
            <p className="text-xs text-faded mt-2">
              {l.seller_name ?? "A member"}{l.contact ? ` · ${l.contact}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
