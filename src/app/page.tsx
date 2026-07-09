import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostCard, oppTypeLabel, Badge, timeAgo, fmtEventDate, authorOf, type Post } from "@/components/ui";
import { Dashboard } from "@/components/Dashboard";
import HeroSlideshow from "@/components/HeroSlideshow";
import CategoryCovers, { type CatStat } from "@/components/CategoryCovers";
import VillageMap from "@/components/VillageMap";
import { CATEGORIES } from "@/lib/categories";
import { getWeather, getAir, getPrayer, getRates, getQuakes } from "@/lib/village";

export const revalidate = 1800;

// A pinned paper note wrapping a community post.
function Note({ post, tilt }: { post: Post; tilt: number }) {
  return (
    <Link href={`/community/${post.id}`}
      className={`note note-tilt-${tilt} block rounded-sm px-4 py-4 hover:-translate-y-0.5 transition-transform`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Badge type={post.type} />
        <span className="text-[11px] text-faded ml-auto">{timeAgo(post.created_at)}</span>
      </div>
      <h3 className="font-semibold leading-snug text-ink">{post.title}</h3>
      {post.type === "event" && post.event_date && (
        <p className="text-xs text-terra-deep mt-1">{fmtEventDate(post.event_date)}{post.event_location ? ` · ${post.event_location}` : ""}</p>
      )}
      <p className="text-[13px] text-faded mt-1.5 line-clamp-3">{post.body.replace(/[*#_]/g, "")}</p>
      <p className="text-[11px] text-faded mt-2" style={{ fontFamily: "var(--font-display)" }}>— {authorOf(post)}</p>
    </Link>
  );
}

function PhotoPin({ url, caption, tilt }: { url: string; caption: string; tilt: number }) {
  return (
    <figure className={`note note-tilt-${tilt} bg-white p-2 pb-3 rounded-sm`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={caption} loading="lazy" className="w-full h-28 object-cover" />
      <figcaption className="text-[11px] text-center text-faded mt-1.5">{caption}</figcaption>
    </figure>
  );
}

function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto mb-5 w-max">
      <span className="note note-tilt-3 inline-block bg-cream px-4 py-1.5 rounded-sm display text-lg font-semibold text-olive-deep">
        {children}
      </span>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const [weather, air, prayer, rates, quakes, postsRes, eventsRes, oppsRes, featRes, catRes] =
    await Promise.all([
      getWeather(), getAir(), getPrayer(), getRates(), getQuakes(),
      supabase.from("posts").select("*, profiles(name)").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(6),
      supabase.from("posts").select("*, profiles(name)").eq("type", "event").gte("event_date", new Date().toISOString()).order("event_date").limit(4),
      supabase.from("opportunities").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(4),
      supabase.from("photos").select("url").eq("featured", true).order("sort"),
      supabase.from("photos").select("category, url, caption, created_at").order("created_at", { ascending: false }),
    ]);

  const posts = (postsRes.data ?? []) as Post[];
  const events = (eventsRes.data ?? []) as Post[];
  const opps = oppsRes.data ?? [];
  const heroImages = (featRes.data ?? []).map((r) => r.url as string);
  const catRows = catRes.data ?? [];

  // category cover stats
  const stats: Record<string, CatStat> = {};
  for (const c of CATEGORIES) stats[c.key] = { count: 0, cover: null };
  for (const r of catRows) {
    const k = (r.category as string) ?? "village";
    if (!stats[k]) stats[k] = { count: 0, cover: null };
    stats[k].count += 1;
    if (!stats[k].cover) stats[k].cover = r.url as string;
  }
  const pinPhotos = catRows.slice(0, 3).map((r) => ({ url: r.url as string, caption: (r.caption as string) ?? "Salda" }));

  return (
    <div>
      {/* Rotating hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <HeroSlideshow images={heroImages} />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/80 to-cream" />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24 text-center">
          <p className="text-sm tracking-widest uppercase text-terra-deep mb-3">Yeşilova · Burdur · Türkiye</p>
          <h1 className="display text-4xl sm:text-6xl font-semibold text-olive-deep leading-tight drop-shadow-sm">
            The village of Güney,<br />open to the world.
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-lg text-ink/80">
            A 900-year-old village, 8 km from Lake Salda. This is its digital home —
            what&apos;s happening, who needs help, and what you can build here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/join" className="px-6 py-3 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors shadow-sm">Become part of Güney</Link>
            <Link href="/guide" className="px-6 py-3 rounded-full bg-white/80 backdrop-blur border border-olive text-olive-deep font-medium hover:bg-white transition-colors">Plan a visit</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <Dashboard weather={weather} air={air} prayer={prayer} rates={rates} quakes={quakes} />

        {/* Map + category gallery */}
        <section className="grid md:grid-cols-2 gap-6 mt-10">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="display text-2xl font-semibold text-olive-deep">Where it is</h2>
              <a href="https://www.google.com/maps/search/?api=1&query=G%C3%BCney%2C+Ye%C5%9Filova%2C+Burdur" target="_blank" rel="noopener noreferrer" className="text-sm text-terra hover:underline">Directions →</a>
            </div>
            <VillageMap />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="display text-2xl font-semibold text-olive-deep">The village in pictures</h2>
              <Link href="/gallery" className="text-sm text-terra hover:underline">All →</Link>
            </div>
            <CategoryCovers stats={stats} />
          </div>
        </section>

        {/* Corkboard */}
        <section className="mt-14">
          <div className="corkboard p-5 sm:p-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Latest */}
              <div className="space-y-4">
                <ColLabel>Latest from the village</ColLabel>
                {posts.slice(0, 3).map((p, i) => <Note key={p.id} post={p} tilt={(i % 4) + 1} />)}
                {pinPhotos[0] && <PhotoPin url={pinPhotos[0].url} caption={pinPhotos[0].caption} tilt={2} />}
                {posts.slice(3, 5).map((p, i) => <Note key={p.id} post={p} tilt={((i + 2) % 4) + 1} />)}
                <Link href="/community" className="block text-center text-sm text-cream/90 hover:text-cream underline pt-1">All updates →</Link>
              </div>

              {/* Coming up */}
              <div className="space-y-4">
                <ColLabel>Coming up</ColLabel>
                {events.length === 0 ? (
                  <div className="note note-tilt-2 rounded-sm px-4 py-6 text-center text-sm text-faded">No events pinned yet.</div>
                ) : events.map((e, i) => <Note key={e.id} post={e} tilt={(i % 4) + 1} />)}
                {pinPhotos[1] && <PhotoPin url={pinPhotos[1].url} caption={pinPhotos[1].caption} tilt={4} />}
                <Link href="/community?type=event" className="block text-center text-sm text-cream/90 hover:text-cream underline pt-1">All events →</Link>
              </div>

              {/* Open doors */}
              <div className="space-y-4">
                <ColLabel>Open doors</ColLabel>
                {opps.slice(0, 3).map((o, i) => (
                  <Link key={o.id} href="/opportunities" className={`note note-tilt-${(i % 4) + 1} block rounded-sm px-4 py-4 hover:-translate-y-0.5 transition-transform`}>
                    <span className="text-[11px] font-medium text-terra-deep uppercase">{oppTypeLabel[o.type] ?? o.type}</span>
                    <h3 className="font-semibold leading-snug mt-0.5 text-ink">{o.title}</h3>
                    <p className="text-[13px] text-faded mt-1.5 line-clamp-3">{o.summary}</p>
                  </Link>
                ))}
                {pinPhotos[2] && <PhotoPin url={pinPhotos[2].url} caption={pinPhotos[2].caption} tilt={1} />}
                <Link href="/opportunities" className="block text-center text-sm text-cream/90 hover:text-cream underline pt-1">All opportunities →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Orientation */}
        <section className="my-12 grid sm:grid-cols-3 gap-4">
          {[
            { href: "/guide", title: "New here?", body: "Where Güney is, how to get here, where to stay — the practical guide." },
            { href: "/opportunities", title: "Want to build?", body: "Stone houses to restore, land to farm, a guesthouse waiting to exist." },
            { href: "/join", title: "Want in?", body: "Join the community — villagers, diaspora, newcomers, visitors. All of it counts." },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="bg-sand/60 rounded-2xl p-6 hover:bg-sand transition-colors">
              <h3 className="display text-xl font-semibold text-olive-deep">{c.title}</h3>
              <p className="text-sm text-faded mt-2">{c.body}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
