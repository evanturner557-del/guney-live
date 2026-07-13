import Link from "next/link";
import { getAdminState } from "@/lib/admin";
import { getWeather, getAir, getPrayer, getRates, getQuakes } from "@/lib/village";
import { POIS } from "@/lib/pois";
import { CATEGORIES } from "@/lib/categories";
import { removeContent, clearFlag, editPost, editPhoto, markEmailRead, deleteEmail } from "./actions";
import OpsRobot from "@/components/OpsRobot";
import RobotButton from "@/components/RobotButton";
import { Card, timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

async function timed<T>(fn: () => Promise<T>): Promise<{ ok: boolean; ms: number }> {
  const t = Date.now();
  try { const r = await fn(); return { ok: r != null, ms: Date.now() - t }; }
  catch { return { ok: false, ms: Date.now() - t }; }
}

function Dot({ ok }: { ok: boolean }) {
  return <span className={`led ${ok ? "led-live" : "led-dead"}`} aria-hidden />;
}

export default async function AdminPage() {
  const { user, isAdmin, supabase } = await getAdminState();

  if (!user) {
    return <Shell><p className="text-faded">Please <Link href="/join" className="text-terra underline">sign in</Link> to access the operations panel.</p></Shell>;
  }
  if (!isAdmin) {
    return <Shell><p className="text-faded">This area is for administrators only.</p></Shell>;
  }

  // --- live feed health ---
  const [w, a, p, r, q] = await Promise.all([
    timed(getWeather), timed(getAir), timed(getPrayer), timed(getRates), timed(getQuakes),
  ]);
  const feeds = [
    { name: "Weather (Open-Meteo)", ...w }, { name: "Air quality (Open-Meteo)", ...a },
    { name: "Prayer times (AlAdhan)", ...p }, { name: "Exchange (open.er-api)", ...r },
    { name: "Earthquakes (USGS)", ...q },
  ];
  const embeds = [
    { name: "Salda lake cam", ok: false, note: "no free feed — 'connect to stream' placeholder" },
    { name: "Live TV (TRT + private HLS)", ok: true, note: "auto-skips dead channels" },
    { name: "Local videos / music / film (YouTube)", ok: true, note: "" },
  ];

  // --- content counts ---
  const tables = ["profiles", "posts", "opportunities", "photos", "listings", "messages"] as const;
  const counts = Object.fromEntries(await Promise.all(tables.map(async (t) => {
    const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
    return [t, count ?? 0] as const;
  })));

  // --- review queue (flagged by the auto-publish screen) ---
  const [fp, fph, fl] = await Promise.all([
    supabase.from("posts").select("id,title,body,flag_reason,author_name").eq("flagged", true).limit(20),
    supabase.from("photos").select("id,caption,url,flag_reason").eq("flagged", true).limit(20),
    supabase.from("listings").select("id,title,description,flag_reason,seller_name").eq("flagged", true).limit(20),
  ]);
  const flagged = [
    ...(fp.data ?? []).map((x) => ({ table: "posts", id: x.id, title: x.title, sub: x.body?.slice(0, 80), who: x.author_name, reason: x.flag_reason })),
    ...(fph.data ?? []).map((x) => ({ table: "photos", id: x.id, title: x.caption || "photo", sub: x.url, who: null, reason: x.flag_reason })),
    ...(fl.data ?? []).map((x) => ({ table: "listings", id: x.id, title: x.title, sub: x.description?.slice(0, 80), who: x.seller_name, reason: x.flag_reason })),
  ];

  // --- recent content (for manual moderation + edit) ---
  const { data: recentPosts } = await supabase.from("posts").select("id,type,title,body,author_name,created_at").order("created_at", { ascending: false }).limit(8);
  const { data: recentPhotos } = await supabase.from("photos").select("id,caption,url,category,is_external").order("created_at", { ascending: false }).limit(8);

  // --- support inbox ---
  const { data: emails, error: emailErr } = await supabase
    .from("support_emails").select("id,from_addr,from_name,subject,body,is_read,flagged,flag_reason,received_at")
    .order("received_at", { ascending: false }).limit(30);
  const unread = (emails ?? []).filter((e) => !e.is_read).length;

  // --- agent activity ---
  const { data: log } = await supabase.from("agent_log")
    .select("id,actor,decision,target_table,summary,reason,created_at")
    .order("created_at", { ascending: false }).limit(40);
  const decisionCount = async (d: string) => {
    const { count } = await supabase.from("agent_log").select("*", { count: "exact", head: true }).eq("decision", d);
    return count ?? 0;
  };
  const [nPublished, nFlagged, nApproved, nRemoved] = await Promise.all([
    decisionCount("published"), decisionCount("flagged"), decisionCount("approved"), decisionCount("removed"),
  ]);

  const approxPois = POIS.filter((x) => !x.verified);

  // agent's live to-do checklist
  const todo = [
    { label: "Flagged items awaiting review", n: flagged.length, done: flagged.length === 0 },
    { label: "Unread support emails", n: unread, done: unread === 0 },
    { label: "Map pins needing exact coordinates", n: approxPois.length, done: approxPois.length === 0 },
  ];
  const decMeta: Record<string, { label: string; cls: string; icon: string }> = {
    published: { label: "Published", cls: "bg-sage/30 text-olive-deep", icon: "✓" },
    flagged: { label: "Flagged", cls: "bg-amber-100 text-amber-800", icon: "⚑" },
    approved: { label: "Approved", cls: "bg-sage/30 text-olive-deep", icon: "👍" },
    removed: { label: "Removed", cls: "bg-terra/15 text-terra-deep", icon: "🗑" },
  };

  return (
    <Shell>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="display text-3xl font-semibold text-olive-deep">Operations</h1>
        <p className="text-sm text-faded">Signed in as {user.email}</p>
      </div>

      {/* THE AGENT — its job, checklist, stats, and live log */}
      <section className="bg-olive-deep text-cream rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="display text-xl font-semibold">The Güney agent</h2>
            <p className="text-xs text-sage">Screens every post, listing, photo and email as it arrives — publishes clean content, flags anything suspicious for you, and keeps this log.</p>
          </div>
        </div>

        {/* decision stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[["Published", nPublished], ["Flagged", nFlagged], ["Approved", nApproved], ["Removed", nRemoved]].map(([l, n]) => (
            <div key={l as string} className="bg-black/20 rounded-xl px-3 py-2 text-center">
              <p className="display text-2xl font-semibold">{n as number}</p>
              <p className="text-[10px] uppercase tracking-wide text-sage">{l as string}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* checklist */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sage mb-1.5">On its list right now</p>
            <div className="space-y-1">
              {todo.map((t) => (
                <div key={t.label} className="flex items-center gap-2 bg-black/15 rounded-lg px-3 py-1.5 text-sm">
                  <span className={t.done ? "text-green-400" : "text-amber-300"}>{t.done ? "✓" : "•"}</span>
                  <span className="flex-1">{t.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.done ? "bg-green-500/20 text-green-200" : "bg-amber-400/20 text-amber-200"}`}>{t.n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* live log */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sage mb-1.5">Live activity log</p>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {(log ?? []).length === 0 ? (
                <p className="text-sm text-sage bg-black/15 rounded-lg px-3 py-2">No activity yet. Every decision it makes will stream here.</p>
              ) : (log ?? []).map((e) => {
                const m = decMeta[e.decision] ?? { label: e.decision, cls: "bg-white/10", icon: "•" };
                return (
                  <div key={e.id} className="flex items-start gap-2 bg-black/15 rounded-lg px-3 py-1.5 text-sm">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${m.cls}`}>{m.icon} {m.label}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{e.summary}</span>
                      {e.reason && <span className="block text-[11px] text-sage truncate">⚑ {e.reason}</span>}
                    </span>
                    <span className="text-[10px] text-sage shrink-0">{timeAgo(e.created_at)}{e.actor === "admin" ? " · you" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Live status */}
      <Section title="Live feeds — what's alive / dead">
        <div className="grid sm:grid-cols-2 gap-2">
          {feeds.map((f) => (
            <div key={f.name} className="flex items-center gap-2 bg-white border border-sand rounded-xl px-3 py-2 text-sm">
              <Dot ok={f.ok} />
              <span className="flex-1">{f.name}</span>
              <span className="text-[11px] text-faded">{f.ok ? `${f.ms}ms` : "down"}</span>
            </div>
          ))}
          {embeds.map((f) => (
            <div key={f.name} className="flex items-center gap-2 bg-white border border-sand rounded-xl px-3 py-2 text-sm">
              <Dot ok={f.ok} />
              <span className="flex-1">{f.name}{f.note && <span className="text-[11px] text-faded"> · {f.note}</span>}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Content counts */}
      <Section title="Content">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {tables.map((t) => (
            <div key={t} className="bg-white border border-sand rounded-xl px-3 py-3 text-center">
              <p className="display text-2xl font-semibold text-olive-deep">{counts[t]}</p>
              <p className="text-[11px] text-faded capitalize">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Review queue */}
      <Section title={`Review queue — flagged by the auto-publish screen (${flagged.length})`}>
        {flagged.length === 0 ? (
          <p className="text-sm text-faded bg-white border border-sand rounded-xl px-3 py-4">Nothing flagged. Clean content publishes automatically; anything suspicious lands here — tap 🤖 on an item and the robot scrubs it.</p>
        ) : (
          <div className="space-y-2">
            {flagged.map((x) => (
              <div key={`${x.table}-${x.id}`} data-robot-row className="bg-white border border-terra/40 rounded-xl px-3 py-2.5 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{x.title}</p>
                  <p className="text-[12px] text-faded truncate">{x.sub}</p>
                  <p className="text-[11px] text-terra-deep mt-0.5">⚑ {x.reason}{x.who ? ` · by ${x.who}` : ""} · {x.table}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <RobotButton action={clearFlag} table={x.table} id={x.id} label="Approve" tone="approve" />
                  <RobotButton action={removeContent} table={x.table} id={x.id} label="Remove" tone="remove" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Recent posts — review + edit */}
      <Section title="Recent posts — review & edit">
        <div className="space-y-1.5">
          {(recentPosts ?? []).map((x) => (
            <details key={x.id} data-robot-row className="bg-white border border-sand rounded-xl group">
              <summary className="px-3 py-2 flex items-center gap-3 text-sm cursor-pointer list-none">
                <span className="text-[10px] uppercase text-faded w-14 shrink-0">{x.type}</span>
                <span className="flex-1 truncate">{x.title}</span>
                <span className="text-[11px] text-faded hidden sm:block">{x.author_name}</span>
                <span className="text-[11px] text-terra group-open:hidden">Edit ↓</span>
              </summary>
              <div className="px-3 pb-3 border-t border-sand pt-3 space-y-2">
                <form action={editPost} className="space-y-2">
                  <input type="hidden" name="id" value={x.id} />
                  <input name="title" defaultValue={x.title} className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
                  <textarea name="body" defaultValue={x.body ?? ""} rows={3} className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
                  <div className="flex items-center gap-2">
                    <button className="text-[11px] px-3 py-1 rounded-full bg-olive text-cream cursor-pointer">Save changes</button>
                    <RobotButton action={removeContent} table="posts" id={x.id} label="Remove" tone="remove" />
                  </div>
                </form>
              </div>
            </details>
          ))}
          {(recentPosts ?? []).length === 0 && <p className="text-sm text-faded">No posts yet.</p>}
        </div>
      </Section>

      {/* Recent photos — review + edit */}
      <Section title="Recent photos — review & edit">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(recentPhotos ?? []).map((x) => (
            <div key={x.id} data-robot-row className="bg-white border border-sand rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.url} alt={x.caption ?? ""} className="w-full h-24 object-cover" />
              <form action={editPhoto} className="p-2 space-y-1.5">
                <input type="hidden" name="id" value={x.id} />
                <input name="caption" defaultValue={x.caption ?? ""} placeholder="Caption" className="w-full border border-sand rounded px-2 py-1 text-[12px]" />
                <select name="category" defaultValue={x.category} className="w-full border border-sand rounded px-2 py-1 text-[12px] bg-cream">
                  {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
                </select>
                <div className="flex items-center gap-1.5">
                  <button className="text-[11px] px-2 py-1 rounded-full bg-olive text-cream cursor-pointer">Save</button>
                  <RobotButton action={removeContent} table="photos" id={x.id} label="Remove" tone="remove" />
                </div>
                <p className="text-[10px] text-faded">{x.is_external ? "external" : "member"}</p>
              </form>
            </div>
          ))}
        </div>
      </Section>

      {/* Support inbox */}
      <Section title={`Inbox — support@guney.live${unread ? ` (${unread} unread)` : ""}`}>
        {emailErr ? (
          <p className="text-sm text-faded bg-white border border-sand rounded-xl px-3 py-4">Inbox table not reachable.</p>
        ) : (emails ?? []).length === 0 ? (
          <p className="text-sm text-faded bg-white border border-sand rounded-xl px-3 py-4">
            No messages yet. Once you connect the free email forwarding (steps in chat), mail to support@guney.live lands here.
          </p>
        ) : (
          <div className="space-y-1.5">
            {(emails ?? []).map((e) => (
              <details key={e.id} className={`bg-white border rounded-xl group ${e.is_read ? "border-sand" : "border-olive/40"}`}>
                <summary className="px-3 py-2 flex items-center gap-3 text-sm cursor-pointer list-none">
                  {!e.is_read && <span className="w-2 h-2 rounded-full bg-olive shrink-0" />}
                  <span className="font-medium truncate max-w-[10rem]">{e.from_name || e.from_addr}</span>
                  <span className="flex-1 truncate text-faded">{e.subject}{e.flagged && <span className="text-terra-deep"> ⚑</span>}</span>
                </summary>
                <div className="px-3 pb-3 border-t border-sand pt-3">
                  <p className="text-[11px] text-faded mb-1">{e.from_addr}{e.flag_reason ? ` · ⚑ ${e.flag_reason}` : ""}</p>
                  <p className="text-sm whitespace-pre-wrap">{e.body}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {!e.is_read && (
                      <form action={markEmailRead}><input type="hidden" name="id" value={e.id} />
                        <button className="text-[11px] px-2 py-1 rounded-full bg-sage/30 text-olive-deep cursor-pointer">Mark read</button></form>
                    )}
                    <a href={`mailto:${e.from_addr}?subject=Re: ${encodeURIComponent(e.subject ?? "")}`} className="text-[11px] px-2 py-1 rounded-full bg-olive text-cream">Reply ↗</a>
                    <form action={deleteEmail}><input type="hidden" name="id" value={e.id} />
                      <button className="text-[11px] px-2 py-1 rounded-full bg-terra/10 text-terra-deep hover:bg-terra hover:text-cream transition-colors cursor-pointer">Delete</button></form>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </Section>

      {/* Map pins to fix */}
      <Section title={`Map pins needing exact coordinates (${approxPois.length})`}>
        <p className="text-[12px] text-faded mb-2">These have no public geodata. Open each in Google Maps, right-click the exact spot → &quot;copy coordinates&quot;, and send them to have the pin locked as verified.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {approxPois.map((x) => (
            <div key={x.key} className="bg-white border border-sand rounded-xl px-3 py-2 text-sm flex items-center gap-2">
              <span>{x.emoji}</span>
              <span className="flex-1">{x.name}</span>
              <span className="text-[11px] text-faded">{x.lat.toFixed(3)}, {x.lng.toFixed(3)} <span className="text-terra-deep">≈</span></span>
            </div>
          ))}
        </div>
      </Section>

      <OpsRobot flaggedCount={flagged.length} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">{children}</div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">{title}</h2>
      {children}
    </section>
  );
}
