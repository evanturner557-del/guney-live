import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostCard, oppTypeLabel, type Post } from "@/components/ui";
import { Dashboard } from "@/components/Dashboard";
import Gallery, { type Photo } from "@/components/Gallery";
import VillageMap from "@/components/VillageMap";
import { getWeather, getAir, getPrayer, getRates, getQuakes } from "@/lib/village";

export const revalidate = 1800;

export default async function Home() {
  const supabase = await createClient();
  const [weather, air, prayer, rates, quakes, postsRes, eventsRes, oppsRes, featRes, galRes] =
    await Promise.all([
      getWeather(), getAir(), getPrayer(), getRates(), getQuakes(),
      supabase.from("posts").select("*, profiles(name)")
        .order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(4),
      supabase.from("posts").select("*, profiles(name)").eq("type", "event")
        .gte("event_date", new Date().toISOString()).order("event_date").limit(3),
      supabase.from("opportunities").select("id, type, title, summary")
        .eq("status", "open").order("created_at", { ascending: false }).limit(3),
      supabase.from("photos").select("*").eq("featured", true).limit(1).maybeSingle(),
      supabase.from("photos").select("*").order("created_at", { ascending: false }).limit(6),
    ]);

  const posts = (postsRes.data ?? []) as Post[];
  const events = (eventsRes.data ?? []) as Post[];
  const opps = oppsRes.data ?? [];
  const hero = featRes.data as Photo | null;
  const gallery = (galRes.data ?? []) as Photo[];

  return (
    <div>
      {/* Hero with Salda image */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.url} alt="Lake Salda near Güney" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-sage to-olive" />
          )}
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
            <Link href="/join" className="px-6 py-3 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors shadow-sm">
              Become part of Güney
            </Link>
            <Link href="/guide" className="px-6 py-3 rounded-full bg-white/80 backdrop-blur border border-olive text-olive-deep font-medium hover:bg-white transition-colors">
              Plan a visit
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Live dashboard */}
        <Dashboard weather={weather} air={air} prayer={prayer} rates={rates} quakes={quakes} />

        {/* Map + Gallery */}
        <section className="grid md:grid-cols-2 gap-6 mt-10">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="display text-2xl font-semibold text-olive-deep">Where it is</h2>
              <a href="https://www.google.com/maps/search/?api=1&query=G%C3%BCney%2C+Ye%C5%9Filova%2C+Burdur"
                target="_blank" rel="noopener noreferrer" className="text-sm text-terra hover:underline">Directions →</a>
            </div>
            <VillageMap />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="display text-2xl font-semibold text-olive-deep">The village in pictures</h2>
              <Link href="/gallery" className="text-sm text-terra hover:underline">All photos →</Link>
            </div>
            <Gallery photos={gallery} />
          </div>
        </section>

        {/* Feed + coming up */}
        <section className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="md:col-span-2">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="display text-2xl font-semibold">Latest from the village</h2>
              <Link href="/community" className="text-sm text-terra hover:underline">All updates →</Link>
            </div>
            <div className="space-y-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="display text-2xl font-semibold mb-4">Coming up</h2>
              {events.length === 0 ? (
                <p className="text-sm text-faded">No upcoming events yet.</p>
              ) : (
                <div className="space-y-3">{events.map((e) => <PostCard key={e.id} post={e} compact />)}</div>
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="display text-2xl font-semibold">Open doors</h2>
                <Link href="/opportunities" className="text-sm text-terra hover:underline">All →</Link>
              </div>
              <div className="space-y-3">
                {opps.map((o) => (
                  <Link key={o.id} href="/opportunities"
                    className="block bg-white rounded-xl border border-sand p-4 hover:border-sage transition-colors">
                    <span className="text-xs font-medium text-terra-deep">{oppTypeLabel[o.type] ?? o.type}</span>
                    <p className="font-semibold leading-snug mt-0.5">{o.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ask + orientation */}
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
