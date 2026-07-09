import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "@/app/actions";
import { PostCard, postTypeMeta, type Post } from "@/components/ui";

export const dynamic = "force-dynamic";

const filters = ["all", "update", "event", "notice", "help"] as const;

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const active = filters.includes((type ?? "all") as (typeof filters)[number]) ? (type ?? "all") : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let q = supabase.from("posts").select("*, profiles(name)")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false }).limit(50);
  if (active !== "all") q = q.eq("type", active);
  const { data } = await q;
  const posts = (data ?? []) as Post[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">Community</h1>
      <p className="text-faded mt-2">
        Daily life in Güney — updates, events, notices, and people who need a hand.
      </p>

      {/* Composer */}
      {user ? (
        <details className="mt-6 bg-white rounded-xl border border-sand">
          <summary className="cursor-pointer px-5 py-4 font-medium text-olive-deep select-none">
            ＋ Share something with the village
          </summary>
          <form action={createPost} className="px-5 pb-5 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <select name="type" className="border border-sand rounded-lg px-3 py-2 text-sm bg-cream" defaultValue="update">
                <option value="update">Update</option>
                <option value="event">Event</option>
                <option value="notice">Notice</option>
                <option value="help">Help needed</option>
              </select>
              <input name="title" required placeholder="Title" maxLength={120}
                className="flex-1 min-w-48 border border-sand rounded-lg px-3 py-2 text-sm" />
            </div>
            <textarea name="body" required rows={4} placeholder="What's happening?"
              className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-3 flex-wrap text-sm">
              <label className="flex items-center gap-2 text-faded">
                Event date <input type="datetime-local" name="event_date" className="border border-sand rounded-lg px-2 py-1.5" />
              </label>
              <input name="event_location" placeholder="Event location (optional)"
                className="border border-sand rounded-lg px-3 py-1.5 flex-1 min-w-40" />
            </div>
            <button className="px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">
              Post
            </button>
          </form>
        </details>
      ) : (
        <p className="mt-6 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">Join the community</Link>{" "}
          to post updates, organise events, and take part.
        </p>
      )}

      {/* Filters */}
      <div className="flex gap-2 mt-8 mb-4 flex-wrap">
        {filters.map((f) => (
          <Link key={f} href={f === "all" ? "/community" : `/community?type=${f}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              active === f ? "bg-olive text-cream border-olive" : "border-sand hover:bg-sand"
            }`}>
            {f === "all" ? "Everything" : postTypeMeta[f].label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {posts.length === 0 && <p className="text-faded text-sm py-8">Nothing here yet.</p>}
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
