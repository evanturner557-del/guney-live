import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AvatarEdit from "@/components/AvatarEdit";
import { Badge, timeAgo } from "@/components/ui";

const connLabel: Record<string, string> = {
  villager: "Villager", diaspora: "Diaspora", newcomer: "Newcomer", visitor: "Visitor",
};

const TIERS = [
  { min: 0, name: "Newcomer", icon: "🌱" },
  { min: 20, name: "Neighbour", icon: "🤝" },
  { min: 50, name: "Contributor", icon: "🌿" },
  { min: 100, name: "Village pillar", icon: "🏛️" },
];
function tierFor(points: number) {
  let cur = TIERS[0], next = null;
  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].min) { cur = TIERS[i]; next = TIERS[i + 1] ?? null; }
  }
  return { cur, next };
}

export default async function YourCorner({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data: me }, { data: allMembers }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("profiles").select("id,name,connection,avatar_url").order("created_at"),
  ]);

  const [myPosts, myListings, myPhotos] = await Promise.all([
    supabase.from("posts").select("id,type,title,created_at,flagged").eq("author_id", userId).order("created_at", { ascending: false }),
    supabase.from("listings").select("id,kind,title,status,created_at").eq("seller_id", userId).order("created_at", { ascending: false }),
    supabase.from("photos").select("id,url,category,created_at").eq("uploaded_by", userId).order("created_at", { ascending: false }),
  ]);
  const posts = myPosts.data ?? [], listings = myListings.data ?? [], photos = myPhotos.data ?? [];

  let comments: { id: string; body: string; author_name: string | null; post_id: string; created_at: string }[] = [];
  if (posts.length) {
    const { data } = await supabase.from("comments")
      .select("id,body,author_name,post_id,created_at,author_id")
      .in("post_id", posts.map((p) => p.id)).neq("author_id", userId)
      .order("created_at", { ascending: false }).limit(5);
    comments = (data ?? []) as typeof comments;
  }

  const points = posts.length * 5 + photos.length * 3 + listings.length * 2 + comments.length;
  const { cur, next } = tierFor(points);
  const pct = next ? Math.min(100, Math.round(((points - cur.min) / (next.min - cur.min)) * 100)) : 100;

  const checklist = [
    { label: "Add a profile photo", done: Boolean(me?.avatar_url) },
    { label: "Write a short bio", done: Boolean(me?.bio) },
    { label: "List a skill you can offer", done: Boolean(me?.skills) },
    { label: "Share your first photo", done: photos.length > 0 },
    { label: "Post your first update", done: posts.length > 0 },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const members = allMembers ?? [];

  return (
    <details open className="rounded-2xl border border-sand overflow-hidden">
      <summary className="cursor-pointer list-none bg-gradient-to-br from-olive to-olive-deep text-cream p-5">
        <div className="flex items-center gap-4">
          <AvatarEdit userId={userId} name={me?.name ?? null} avatarUrl={me?.avatar_url ?? null} />
          <div className="min-w-0">
            <p className="text-sage text-sm">Your corner,</p>
            <h2 className="display text-xl sm:text-2xl font-semibold leading-tight truncate">{me?.name ?? "friend"}</h2>
            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-black/20">{connLabel[me?.connection ?? "newcomer"]}</span>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-2xl">{cur.icon}</p>
            <p className="text-xs font-medium">{cur.name} · {points} pts</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-sage mb-1">
            <span>{cur.icon} {cur.name}</span>
            {next ? <span>{next.min - points} pts to {next.icon} {next.name}</span> : <span>Top tier — thank you 💛</span>}
          </div>
          <div className="h-2 rounded-full bg-black/25 overflow-hidden">
            <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </summary>

      <div className="grid sm:grid-cols-3 gap-3 p-4 bg-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">Getting started · {doneCount}/{checklist.length}</p>
          <div className="space-y-1.5">
            {checklist.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${c.done ? "bg-olive text-cream" : "border border-sand"}`}>{c.done ? "✓" : ""}</span>
                <span className={c.done ? "text-faded line-through" : ""}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">Your inbox</p>
          {comments.length === 0 ? (
            <p className="text-sm text-faded">No replies yet.</p>
          ) : (
            <div className="space-y-1.5">
              {comments.map((c) => (
                <Link key={c.id} href={`/community/${c.post_id}`} className="block bg-sand/40 rounded-lg px-3 py-2 hover:bg-sand transition-colors">
                  <p className="text-[13px]"><span className="font-medium">{c.author_name ?? "Someone"}</span> replied</p>
                  <p className="text-xs text-faded truncate">{c.body}</p>
                  <p className="text-[10px] text-faded mt-0.5">{timeAgo(c.created_at)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">Who&apos;s here · {members.length}</p>
          <details className="group">
            <summary className="cursor-pointer list-none flex -space-x-2">
              {members.slice(0, 6).map((m) => (
                <span key={m.id} className="w-8 h-8 rounded-full bg-sage/40 ring-2 ring-white flex items-center justify-center display text-xs font-semibold text-olive-deep overflow-hidden">
                  {m.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={m.avatar_url} alt={m.name ?? ""} className="w-full h-full object-cover" />
                    : (m.name?.[0]?.toUpperCase() ?? "?")}
                </span>
              ))}
              <span className="text-xs text-terra self-center ml-3 group-open:hidden">See all →</span>
            </summary>
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm py-1">
                  <span className="w-6 h-6 rounded-full bg-sage/40 flex items-center justify-center text-[10px] font-semibold text-olive-deep shrink-0">{m.name?.[0]?.toUpperCase() ?? "?"}</span>
                  <span className="truncate">{m.name}</span>
                  <span className="text-[11px] text-faded ml-auto">{connLabel[m.connection] ?? m.connection}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      {(posts.length > 0 || listings.length > 0) && (
        <div className="px-4 pb-4 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">Things you&apos;ve made</p>
          <div className="space-y-1">
            {posts.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/community/${p.id}`} className="flex items-center gap-2 text-sm hover:text-terra">
                <Badge type={p.type} />
                <span className="flex-1 truncate">{p.title}</span>
                {p.flagged && <span className="text-[10px] text-amber-700" title="Held for review">⚑</span>}
              </Link>
            ))}
            {listings.slice(0, 3).map((l) => (
              <Link key={l.id} href="/community/marketplace" className="flex items-center gap-2 text-sm hover:text-terra">
                <span className="text-[10px] uppercase text-faded w-14 shrink-0">{l.kind}</span>
                <span className="flex-1 truncate">{l.title}</span>
                <span className="text-[11px] text-faded">{l.status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </details>
  );
}
