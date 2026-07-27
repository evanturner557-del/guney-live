import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, timeAgo, fmtEventDate, authorOf, oppTypeLabel, type Post } from "@/components/ui";
import HeroSlideshow from "@/components/HeroSlideshow";
import VillageMap from "@/components/VillageMap";
import { getWeather, getPrayer, wmoIcon, wmoLabel } from "@/lib/village";

export const revalidate = 1800;

const explore = [
  { href: "/guide#getting-here", icon: "🧭", title: "Getting here", body: "Where Güney is and how to reach it — 8 km from Lake Salda." },
  { href: "/guide#staying", icon: "🛏️", title: "Stay", body: "Beds, food, and what to do when you're here." },
  { href: "/guide#living", icon: "🏡", title: "Living here", body: "Internet, healthcare, property, and the rhythm of the seasons." },
  { href: "/guide#nature", icon: "🌿", title: "Nature", body: "Lake Salda and the landscape that surrounds the village." },
  { href: "/guide#photos", icon: "📷", title: "In pictures", body: "The village as it actually looks, place by place." },
  { href: "#map", icon: "🗺️", title: "The map", body: "Every landmark, road, and place worth knowing." },
];

export default async function Home() {
  const supabase = await createClient();
  const [weather, prayer, postsRes, eventRes, oppsRes, featRes] = await Promise.all([
    getWeather(), getPrayer(),
    supabase.from("posts").select("*, profiles(name)").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(3),
    supabase.from("posts").select("*, profiles(name)").eq("type", "event").gte("event_date", new Date().toISOString()).order("event_date", { ascending: true }).limit(1),
    supabase.from("opportunities").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(2),
    supabase.from("photos").select("url").eq("featured", true).order("sort"),
  ]);

  const posts = (postsRes.data ?? []) as Post[];
  const nextEvent = ((eventRes.data ?? []) as Post[])[0];
  const opps = oppsRes.data ?? [];
  const heroImages = (featRes.data ?? []).map((r) => r.url as string);
  const latest = posts[0];

  return (
    <div>
      {/* Welcome */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <HeroSlideshow images={heroImages} />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/20 via-cream/35 to-cream" />
        </div>
        <div className="mx-auto max-w-5xl px-4 min-h-[68vh] flex flex-col items-center justify-center text-center py-20">
          <p className="text-sm tracking-widest uppercase text-terra-deep mb-3">Yeşilova · Burdur · Türkiye</p>
          <h1 className="display text-4xl sm:text-6xl font-semibold text-olive-deep leading-tight drop-shadow-sm">
            Welcome to Güney.
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-lg text-ink/80">
            A 900-year-old village rebuilding itself with the world.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/guide" className="px-7 py-3.5 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors shadow-sm">Visit</Link>
            <Link href="/join" className="px-7 py-3.5 rounded-full bg-white/80 backdrop-blur border border-olive text-olive-deep font-medium hover:bg-white transition-colors">Join</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Today — one card, like walking into the square */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white border border-sand p-6 sm:p-8">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h2 className="display text-2xl font-semibold text-olive-deep">Today in the village</h2>
              <Link href="/guide#now" className="text-sm text-terra hover:underline">Live dashboard →</Link>
            </div>
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-[15px]">
              <p className="flex items-center gap-2.5">
                <span className="text-2xl">{weather ? wmoIcon(weather.now.code, weather.now.isDay) : "⛅"}</span>
                <span>{weather ? <>{Math.round(weather.now.temp)}° · {wmoLabel(weather.now.code)}</> : "Weather offline"}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="text-2xl">🕌</span>
                <span>{prayer ? <>Next prayer · {prayer.next} {prayer.timings.find((t) => t.name === prayer.next)?.time}</> : "Prayer times offline"}</span>
              </p>
              <p className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl">📅</span>
                {nextEvent ? (
                  <Link href={`/community/${nextEvent.id}`} className="truncate hover:text-terra transition-colors">
                    {fmtEventDate(nextEvent.event_date!)} · {nextEvent.title}
                  </Link>
                ) : <span className="text-faded">No events planned yet</span>}
              </p>
              <p className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl">🗣️</span>
                {latest ? (
                  <Link href={`/community/${latest.id}`} className="truncate hover:text-terra transition-colors">{latest.title}</Link>
                ) : <span className="text-faded">Quiet on the square</span>}
              </p>
            </div>
          </div>
        </section>

        {/* Discover */}
        <section className="mt-20">
          <h2 className="display text-3xl font-semibold text-olive-deep text-center">Explore the village</h2>
          <p className="text-faded text-center mt-2 max-w-md mx-auto">Every card opens into its own corner of Güney.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {explore.map((c) => (
              <Link key={c.title} href={c.href}>
                <div className="rounded-3xl bg-white border border-sand p-7 h-full hover:border-sage hover:-translate-y-0.5 transition-all">
                  <span className="text-3xl">{c.icon}</span>
                  <h3 className="display text-xl font-semibold text-olive-deep mt-3">{c.title}</h3>
                  <p className="text-sm text-faded mt-1.5 leading-relaxed">{c.body}</p>
                </div>
              </Link>
            ))}
          </div>
          <div id="map" className="mt-8 scroll-mt-20">
            <VillageMap />
          </div>
        </section>

        {/* Meet */}
        <section className="mt-20">
          <h2 className="display text-3xl font-semibold text-olive-deep text-center">The people</h2>
          <p className="text-faded text-center mt-2 max-w-md mx-auto">Villagers, diaspora, visitors, builders — what they&apos;re saying now.</p>
          <div className="mt-8 max-w-2xl mx-auto rounded-3xl bg-white border border-sand px-7 py-4">
            {posts.length === 0 ? (
              <p className="text-sm text-faded py-4">Nothing posted yet — be the first voice.</p>
            ) : posts.map((p) => (
              <Link key={p.id} href={`/community/${p.id}`} className="flex items-start gap-3 py-3.5 border-b border-sand last:border-0 hover:text-terra transition-colors">
                <Badge type={p.type} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug truncate">{p.title}</p>
                  <p className="text-xs text-faded mt-0.5">{authorOf(p)} · {timeAgo(p.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-center mt-6">
            <Link href="/community" className="px-6 py-3 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep transition-colors">Step into the community</Link>
          </p>
        </section>

        {/* Participate */}
        {opps.length > 0 && (
          <section className="mt-20">
            <h2 className="display text-3xl font-semibold text-olive-deep text-center">Open doors</h2>
            <p className="text-faded text-center mt-2 max-w-md mx-auto">Stone houses to restore, land to farm, work waiting for hands.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {opps.map((o) => (
                <Link key={o.id} href="/community/opportunities">
                  <div className="rounded-3xl bg-white border border-sand p-7 h-full hover:border-sage hover:-translate-y-0.5 transition-all">
                    <span className="text-[11px] font-medium text-terra-deep uppercase tracking-wide">{oppTypeLabel[o.type] ?? o.type}</span>
                    <h3 className="display text-lg font-semibold text-olive-deep leading-snug mt-1">{o.title}</h3>
                    <p className="text-sm text-faded mt-2 line-clamp-2">{o.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-center mt-6">
              <Link href="/community/opportunities" className="text-sm text-terra hover:underline">See every open door →</Link>
            </p>
          </section>
        )}

        {/* Belong */}
        <section className="my-20">
          <div className="rounded-3xl bg-olive-deep text-cream px-7 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="display text-3xl sm:text-4xl font-semibold">Become part of Güney</h2>
            <p className="mt-3 text-cream/80 max-w-lg mx-auto">However you arrive — for a weekend, for good, or from afar — there is a place for you here.</p>
            <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              {[
                { href: "/guide", icon: "🧳", title: "Visit", body: "Come and see it with your own eyes." },
                { href: "/join", icon: "🏡", title: "Move", body: "Make the village your home." },
                { href: "/community/opportunities", icon: "🔨", title: "Help build", body: "Lend your hands or your skills." },
              ].map((c) => (
                <Link key={c.title} href={c.href}>
                  <div className="rounded-2xl bg-cream/10 hover:bg-cream/20 transition-colors p-5 h-full">
                    <span className="text-2xl">{c.icon}</span>
                    <h3 className="display text-lg font-semibold mt-2">{c.title}</h3>
                    <p className="text-sm text-cream/75 mt-1">{c.body}</p>
                  </div>
                </Link>
              ))}
            </div>
            <p className="mt-10">
              <Link href="/join" className="inline-block px-8 py-3.5 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors">Join the village</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
