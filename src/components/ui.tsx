import Link from "next/link";
import ReactMarkdown from "react-markdown";

export const postTypeMeta: Record<string, { label: string; cls: string }> = {
  update: { label: "Update", cls: "bg-sage/30 text-olive-deep" },
  event: { label: "Event", cls: "bg-terra/15 text-terra-deep" },
  notice: { label: "Notice", cls: "bg-olive/15 text-olive-deep" },
  help: { label: "Help needed", cls: "bg-amber-100 text-amber-800" },
};

export const oppTypeLabel: Record<string, string> = {
  land: "Land", property: "Property", restoration: "Restoration",
  business: "Business", farm: "Farming", skills: "Skills",
  volunteer: "Volunteer", collaboration: "Collaboration",
};

export function Badge({ type }: { type: string }) {
  const m = postTypeMeta[type] ?? postTypeMeta.update;
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${m.cls}`}>
      {m.label}
    </span>
  );
}

export function Md({ children }: { children: string }) {
  return (
    <div className="prose-md text-[15px]">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function fmtEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long",
  });
}

export type Post = {
  id: string; type: string; title: string; body: string;
  author_name: string | null; created_at: string; pinned: boolean;
  event_date: string | null; event_location: string | null;
  profiles?: { name: string } | null;
};

export function authorOf(p: { author_name: string | null; profiles?: { name: string } | null }) {
  return p.profiles?.name ?? p.author_name ?? "A member";
}

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <Link href={`/community/${post.id}`}
      className="block bg-white rounded-xl border border-sand p-5 hover:border-sage transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Badge type={post.type} />
        {post.pinned && <span className="text-xs text-faded">📌 pinned</span>}
        <span className="text-xs text-faded ml-auto">{timeAgo(post.created_at)}</span>
      </div>
      <h3 className="font-semibold text-lg leading-snug">{post.title}</h3>
      {post.type === "event" && post.event_date && (
        <p className="text-sm text-terra-deep mt-1">
          {fmtEventDate(post.event_date)}
          {post.event_location ? ` · ${post.event_location}` : ""}
        </p>
      )}
      {!compact && (
        <p className="text-[15px] text-faded mt-2 line-clamp-2">{post.body.replace(/[*#_]/g, "")}</p>
      )}
      <p className="text-xs text-faded mt-3">{authorOf(post)}</p>
    </Link>
  );
}
