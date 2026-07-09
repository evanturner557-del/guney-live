import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createComment } from "@/app/actions";
import { Badge, Md, authorOf, fmtEventDate, timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase.from("posts").select("*, profiles(name)").eq("id", id).single(),
    supabase.from("comments").select("*, profiles(name)").eq("post_id", id).order("created_at"),
  ]);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/community" className="text-sm text-terra hover:underline">← Community</Link>
      <article className="mt-4 bg-white rounded-2xl border border-sand p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge type={post.type} />
          <span className="text-xs text-faded ml-auto">{timeAgo(post.created_at)}</span>
        </div>
        <h1 className="display text-2xl sm:text-3xl font-semibold text-olive-deep leading-tight">
          {post.title}
        </h1>
        {post.type === "event" && post.event_date && (
          <p className="text-terra-deep mt-2">
            {fmtEventDate(post.event_date)}
            {post.event_location ? ` · ${post.event_location}` : ""}
          </p>
        )}
        <p className="text-sm text-faded mt-1 mb-5">by {authorOf(post)}</p>
        <Md>{post.body}</Md>
      </article>

      <section className="mt-8">
        <h2 className="display text-xl font-semibold mb-4">
          Conversation ({comments?.length ?? 0})
        </h2>
        <div className="space-y-3">
          {(comments ?? []).map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-sand px-4 py-3">
              <p className="text-sm">{c.body}</p>
              <p className="text-xs text-faded mt-1.5">
                {authorOf(c)} · {timeAgo(c.created_at)}
              </p>
            </div>
          ))}
        </div>
        {user ? (
          <form action={createComment} className="mt-4 flex gap-2">
            <input type="hidden" name="post_id" value={post.id} />
            <input name="body" required placeholder="Add to the conversation…"
              className="flex-1 border border-sand rounded-full px-4 py-2.5 text-sm bg-white" />
            <button className="px-5 py-2.5 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">
              Send
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-faded">
            <Link href="/join" className="text-terra hover:underline">Join</Link> to take part in the conversation.
          </p>
        )}
      </section>
    </div>
  );
}
