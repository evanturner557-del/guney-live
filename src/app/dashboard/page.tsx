import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions";
import AvatarEdit from "@/components/AvatarEdit";
import { Badge, timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

const connLabel: Record<string, string> = {
  villager: "Villager", diaspora: "Diaspora", newcomer: "Newcomer", visitor: "Visitor",
};

// contribution tiers — light gamification
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/join");

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  // their content
  const [myPosts, myListings, myPhotos] = await Promise.all([
    supabase.from("posts").select("id,type,title,created_at,flagged").eq("author_id", user.id).order("created_at", { ascending: false }),
    supabase.from("listings").select("id,kind,title,status,created_at").eq("seller_id", user.id).order("created_at", { ascending: false }),
    supabase.from("photos").select("id,url,category,created_at").eq("uploaded_by", user.id).order("created_at", { ascending: false }),
  ]);
  const posts = myPosts.data ?? [], listings = myListings.data ?? [], photos = myPhotos.data ?? [];

  // notifications: comments on my posts, by others
  let comments: { id: string; body: string; author_name: string | null; post_id: string; created_at: string }[] = [];
  if (posts.length) {
    const { data } = await supabase.from("comments")
      .select("id,body,author_name,post_id,created_at,author_id")
      .in("post_id", posts.map((p) => p.id)).neq("author_id", user.id)
      .order("created_at", { ascending: false }).limit(8);
    comments = (data ?? []) as typeof comments;
  }

  // points + tier
  const points = posts.length * 5 + photos.length * 3 + listings.length * 2 + comments.length;
  const { cur, next } = tierFor(points);
  const pct = next ? Math.min(100, Math.round(((points - cur.min) / (next.min - cur.min)) * 100)) : 100;

  // profile-completion checklist (gamified onboarding)
  const checklist = [
    { label: "Add a profile photo", done: Boolean(me?.avatar_url) },
    { label: "Write a short bio", done: Boolean(me?.bio) },
    { label: "List a skill you can offer", done: Boolean(me?.skills) },
    { label: "Share your first photo", done: photos.length > 0 },
    { label: "Post your first update", done: posts.length > 0 },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const shortcuts = [
    { href: "/community/chat", icon: "💬", label: "Town Square", sub: "Live chat" },
    { href: "/community/marketplace", icon: "🛒", label: "Marketplace", sub: "Buy · sell · give" },
    { href: "/community", icon: "📣", label: "Community", sub: "Notices & events" },
    { href: "/opportunities", icon: "🌍", label: "Opportunities", sub: "Build here" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <div className="rounded-3xl overflow-hidden border border-sand">
        <div className="bg-gradient-to-br from-olive to-olive-deep text-cream p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <AvatarEdit userId={user.id} name={me?.name ?? null} avatarUrl={me?.avatar_url ?? null} />
            <div className="min-w-0">
              <p className="text-sage text-sm">Welcome back,</p>
              <h1 className="display text-2xl sm:text-3xl font-semibold leading-tight truncate">{me?.name ?? "friend"}</h1>
              <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-black/20">{connLabel[me?.connection ?? "newcomer"]}</span>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-3xl">{cur.icon}</p>
              <p className="text-sm font-medium">{cur.name}</p>
              <p className="text-[11px] text-sage">{points} pts</p>
            </div>
          </div>
          {/* level progress */}
          <div className="mt-5">
            <div className="flex justify-between text-[11px] text-sage mb-1">
              <span>{cur.icon} {cur.name}</span>
              {next ? <span>{next.min - points} pts to {next.icon} {next.name}</span> : <span>Top tier — thank you 💛</span>}
            </div>
            <div className="h-2 rounded-full bg-black/25 overflow-hidden">
              <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        {/* Left: getting started + notifications */}
        <div className="space-y-4">
          <Panel title={`Getting started · ${doneCount}/${checklist.length}`}>
            <div className="space-y-1.5">
              {checklist.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${c.done ? "bg-olive text-cream" : "border border-sand"}`}>{c.done ? "✓" : ""}</span>
                  <span className={c.done ? "text-faded line-through" : ""}>{c.label}</span>
                </div>
              ))}
            </div>
            {doneCount < checklist.length && <p className="text-[11px] text-faded mt-2">Each one earns points and helps the village know you.</p>}
          </Panel>

          <Panel title="Your inbox">
            {comments.length === 0 ? (
              <p className="text-sm text-faded">No replies yet. When someone comments on your posts, it shows here.</p>
            ) : (
              <div className="space-y-2">
                {comments.map((c) => (
                  <Link key={c.id} href={`/community/${c.post_id}`} className="block bg-sand/40 rounded-lg px-3 py-2 hover:bg-sand transition-colors">
                    <p className="text-[13px]"><span className="font-medium">{c.author_name ?? "Someone"}</span> replied</p>
                    <p className="text-xs text-faded truncate">{c.body}</p>
                    <p className="text-[10px] text-faded mt-0.5">{timeAgo(c.created_at)}</p>
                  </Link>
                ))}
              </div>
            )}
            <p className="text-[11px] text-faded mt-2">Direct messages between members are coming soon.</p>
          </Panel>
        </div>

        {/* Middle: shortcuts + your stuff */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shortcuts.map((s) => (
              <Link key={s.href} href={s.href} className="bg-white border border-sand rounded-2xl p-4 hover:-translate-y-0.5 hover:border-olive transition-all">
                <p className="text-2xl">{s.icon}</p>
                <p className="font-medium text-sm mt-1">{s.label}</p>
                <p className="text-[11px] text-faded">{s.sub}</p>
              </Link>
            ))}
          </div>

          <Panel title="Things you've made">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[["Posts", posts.length], ["Listings", listings.length], ["Photos", photos.length]].map(([l, n]) => (
                <div key={l as string} className="bg-sand/40 rounded-xl px-3 py-2 text-center">
                  <p className="display text-xl font-semibold text-olive-deep">{n as number}</p>
                  <p className="text-[11px] text-faded">{l as string}</p>
                </div>
              ))}
            </div>
            {posts.length === 0 && listings.length === 0 && photos.length === 0 ? (
              <p className="text-sm text-faded">Nothing yet. Post an update, list something, or share a photo — it&apos;ll appear here.</p>
            ) : (
              <div className="space-y-1.5">
                {posts.slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/community/${p.id}`} className="flex items-center gap-2 text-sm hover:text-terra">
                    <Badge type={p.type} />
                    <span className="flex-1 truncate">{p.title}</span>
                    {p.flagged && <span className="text-[10px] text-amber-700" title="Held for review">⚑</span>}
                    <span className="text-[11px] text-faded">{timeAgo(p.created_at)}</span>
                  </Link>
                ))}
                {listings.slice(0, 3).map((l) => (
                  <Link key={l.id} href="/community/marketplace" className="flex items-center gap-2 text-sm hover:text-terra">
                    <span className="text-[10px] uppercase text-faded w-14 shrink-0">{l.kind}</span>
                    <span className="flex-1 truncate">{l.title}</span>
                    <span className="text-[11px] text-faded">{l.status}</span>
                  </Link>
                ))}
                {photos.length > 0 && (
                  <div className="flex gap-1.5 pt-1">
                    {photos.slice(0, 6).map((ph) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={ph.id} src={ph.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </Panel>

          {/* Profile edit */}
          <Panel title="Your profile">
            <form action={updateProfile} className="space-y-2.5">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <input name="name" required defaultValue={me?.name ?? ""} placeholder="Name" className="border border-sand rounded-lg px-3 py-2 text-sm" />
                <select name="connection" defaultValue={me?.connection ?? "newcomer"} className="border border-sand rounded-lg px-3 py-2 text-sm bg-white">
                  {Object.entries(connLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <textarea name="bio" rows={2} defaultValue={me?.bio ?? ""} placeholder="A line about you and your connection to the village" className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
              <input name="skills" defaultValue={me?.skills ?? ""} placeholder="Skills you can offer" className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
              <input name="phone" defaultValue={me?.phone ?? ""} placeholder="Phone (private — for direct messages later)" className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
              <button className="px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">Save profile</button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-sand rounded-2xl p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-faded mb-2.5">{title}</h2>
      {children}
    </div>
  );
}
