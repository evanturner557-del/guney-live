import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, timeAgo, fmtEventDate, authorOf, oppTypeLabel, type Post } from "@/components/ui";
import { Dashboard } from "@/components/Dashboard";
import HeroSlideshow from "@/components/HeroSlideshow";
import VillageMap from "@/components/VillageMap";
import { getWeather, getAir, getAirCompare, getPrayer, getRates, getQuakes } from "@/lib/village";

export const revalidate = 1800;

function PostRow({ post }: { post: Post }) {
  return (
    <Link href={`/community/${post.id}`} className="flex items-start gap-3 py-3 first:pt-0 border-b border-sand last:border-0 hover:text-terra transition-colors">
      <Badge type={post.type} />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug truncate">{post.title}</p>
        {post.type === "event" && post.event_date && (
          <p className="text-xs text-terra-deep mt-0.5">{fmtEventDate(post.event_date)}{post.event_location ? ` · ${post.event_location}` : ""}</p>
        )}
        <p className="text-xs text-faded mt-0.5">{authorOf(post)} · {timeAgo(post.created_at)}</p>
      </div>
    </Link>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const [weather, air, airCompare, prayer, rates, quakes, postsRes, oppsRes, featRes] =
    await Promise.all([
      getWeather(), getAir(), getAirCompare(), getPrayer(), getRates(), getQuakes(),
      supabase.from("posts").select("*, profiles(name)").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(5),
      supabase.from("opportunities").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(2),
      supabase.from("photos").select("url").eq("featured", true).order("sort"),
    ]);

  const posts = (postsRes.data ?? []) as Post[];
  const opps = oppsRes.data ?? [];
  const heroImages = (featRes.data ?? []).map((r) => r.url as string);

  return (
    <div>
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <HeroSlideshow images={heroImages} />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/25 via-cream/40 to-cream" />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24 text-center">
          <p className="text-sm tracking-widest uppercase text-terra-deep mb-3">Yeşilova · Burdur · Türkiye</p>
          <h1 className="display text-4xl sm:text-6xl font-semibold text-olive-deep leading-tight drop-shadow-sm">
            The village of Güney,<br />open to the world.
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-lg text-ink/80">
            A 900-year-old village 8 km from Lake Salda — see what&apos;s happening, find who can help, and join the people building its future.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/join" className="px-6 py-3 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors shadow-sm">Join the village</Link>
            <Link href="/guide" className="px-6 py-3 rounded-full bg-white/80 backdrop-blur border border-olive text-olive-deep font-medium hover:bg-white transition-colors">Read the guide</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <Dashboard weather={weather} air={air} airCompare={airCompare} prayer={prayer} rates={rates} quakes={quakes} />

        <section className="grid md:grid-cols-[1fr_20rem] gap-6 mt-10">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="display text-2xl font-semibold text-olive-deep">Where it is</h2>
              <a href="https://www.google.com/maps/search/?api=1&query=G%C3%BCney%2C+Ye%C5%9Filova%2C+Burdur" target="_blank" rel="noopener noreferrer" className="text-sm text-terra hover:underline">Directions →</a>
            </div>
            <VillageMap />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="display text-2xl font-semibold text-olive-deep">Latest</h2>
              <Link href="/community" className="text-sm text-terra hover:underline">All →</Link>
            </div>
            <Card>
              {posts.length === 0 ? (
                <p className="text-sm text-faded py-4">Nothing posted yet.</p>
              ) : posts.slice(0, 5).map((p) => <PostRow key={p.id} post={p} />)}
            </Card>
          </div>
        </section>

        {opps.length > 0 && (
          <section className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="display text-2xl font-semibold text-olive-deep">Open doors</h2>
              <Link href="/community/opportunities" className="text-sm text-terra hover:underline">All →</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {opps.map((o) => (
                <Link key={o.id} href="/community/opportunities">
                  <Card className="hover:border-sage transition-colors h-full">
                    <span className="text-[11px] font-medium text-terra-deep uppercase">{oppTypeLabel[o.type] ?? o.type}</span>
                    <h3 className="font-semibold leading-snug mt-0.5">{o.title}</h3>
                    <p className="text-[13px] text-faded mt-1.5 line-clamp-2">{o.summary}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="my-12 grid sm:grid-cols-3 gap-4">
          {[
            { href: "/guide", title: "New here?", body: "Where Güney is, how to get here, where to stay — the practical guide." },
            { href: "/community/opportunities", title: "Want to build?", body: "Stone houses to restore, land to farm, a guesthouse waiting to exist." },
            { href: "/join", title: "Want in?", body: "Join the community — villagers, diaspora, newcomers, visitors. All of it counts." },
          ].map((c) => (
            <Link key={c.href} href={c.href}>
              <Card className="hover:border-sage transition-colors h-full">
                <h3 className="display text-xl font-semibold text-olive-deep">{c.title}</h3>
                <p className="text-sm text-faded mt-2">{c.body}</p>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
