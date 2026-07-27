import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, timeAgo, authorOf, oppTypeLabel, type Post } from "@/components/ui";
import HeroSlideshow from "@/components/HeroSlideshow";
import VillageMap from "@/components/VillageMap";
import Reveal from "@/components/Reveal";
import { getWeather, getPrayer, wmoLabel } from "@/lib/village";

export const revalidate = 1800;

const doors = [
  { href: "/guide", title: "The place", body: "Stone houses, vineyards, and the clearest lake in Türkiye eight kilometres up the road." },
  { href: "/community", title: "The people", body: "Villagers, diaspora, and the newly arrived — talking to each other every day." },
  { href: "/community/opportunities", title: "The work", body: "Houses waiting to be restored, land waiting to be farmed, ideas waiting for hands." },
];

// One quiet sentence composed from live data — the village speaks, no widgets.
function livingLine(weather: Awaited<ReturnType<typeof getWeather>>, prayer: Awaited<ReturnType<typeof getPrayer>>) {
  const hour = Number(new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hour12: false }));
  const daypart = hour < 6 ? "Tonight" : hour < 12 ? "This morning" : hour < 18 ? "This afternoon" : hour < 22 ? "This evening" : "Tonight";
  const parts: string[] = [];
  if (weather) parts.push(`${daypart} in Güney it is ${wmoLabel(weather.now.code).toLowerCase()} at ${Math.round(weather.now.temp)}°.`);
  if (prayer) {
    const t = prayer.timings.find((p) => p.name === prayer.next)?.time;
    if (t) parts.push(`${prayer.next} is at ${t}.`);
  }
  return parts.join(" ");
}

export default async function Home() {
  const supabase = await createClient();
  const [weather, prayer, postsRes, oppsRes, featRes] = await Promise.all([
    getWeather(), getPrayer(),
    supabase.from("posts").select("*, profiles(name)").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(3),
    supabase.from("opportunities").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(2),
    supabase.from("photos").select("url").eq("featured", true).order("sort"),
  ]);

  const posts = (postsRes.data ?? []) as Post[];
  const opps = oppsRes.data ?? [];
  const heroImages = (featRes.data ?? []).map((r) => r.url as string);
  const line = livingLine(weather, prayer);

  return (
    <div>
      {/* Wonder */}
      <section className="relative -mt-14">
        <div className="absolute inset-0 overflow-hidden">
          <HeroSlideshow images={heroImages} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/25" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 min-h-[92svh] flex flex-col justify-end pb-16 pt-32">
          <div className="max-w-2xl hero-enter">
            <p className="whisper text-cream/85 text-lg">Yeşilova · Burdur · Türkiye</p>
            <h1 className="display text-5xl sm:text-7xl font-medium text-cream leading-[1.05] mt-3">
              Welcome to Güney.
            </h1>
            <p className="mt-5 text-xl text-cream/90 max-w-lg leading-relaxed">
              A 900-year-old village rebuilding itself with the world.
            </p>
          </div>
          <div className="mt-9 flex items-center gap-6 hero-enter-late">
            <Link href="/guide" className="px-8 py-4 rounded-full bg-cream text-ink font-medium hover:bg-white transition-colors">
              Visit the village
            </Link>
            <Link href="/join" className="text-cream/85 hover:text-cream underline underline-offset-4 decoration-cream/40 transition-colors">
              or join from afar
            </Link>
          </div>
          {line && <p className="whisper text-cream/70 mt-10 text-[17px] hero-enter-late">{line}</p>}
        </div>
      </section>

      {/* Curiosity */}
      <section className="mx-auto max-w-4xl px-6 py-32 sm:py-40 text-center">
        <Reveal slow>
          <p className="display text-3xl sm:text-[2.75rem] leading-snug text-olive-deep font-medium">
            Nine hundred years of stone, vines and weather.
            <span className="whisper text-faded"> The people who kept it are now opening it to the world.</span>
          </p>
        </Reveal>
      </section>

      {/* Three doors */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {doors.map((d, i) => (
            <Reveal key={d.title} className={i === 1 ? "md:mt-10" : ""}>
              <Link href={d.href} className="group block rounded-[2rem] bg-sand/50 hover:bg-sand transition-colors p-10 h-full">
                <h2 className="display text-3xl font-medium text-olive-deep">{d.title}</h2>
                <p className="mt-4 text-faded leading-relaxed">{d.body}</p>
                <p className="mt-8 text-terra group-hover:translate-x-1 transition-transform inline-block" aria-hidden>⟶</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Walk it */}
      <section className="mx-auto max-w-6xl px-6 pt-32 sm:pt-40">
        <Reveal>
          <p className="whisper text-terra text-lg">Eight kilometres from Lake Salda</p>
          <h2 className="display text-4xl sm:text-5xl font-medium text-olive-deep mt-2 max-w-xl">Walk it from here.</h2>
        </Reveal>
        <Reveal slow className="mt-10">
          <div className="rounded-[2rem] overflow-hidden">
            <VillageMap height={440} />
          </div>
        </Reveal>
      </section>

      {/* Trust — real voices */}
      <section className="mx-auto max-w-3xl px-6 pt-32 sm:pt-40">
        <Reveal>
          <p className="whisper text-terra text-lg text-center">From the square</p>
          <h2 className="display text-4xl sm:text-5xl font-medium text-olive-deep mt-2 text-center">What the village is saying</h2>
        </Reveal>
        <Reveal className="mt-12">
          {posts.length === 0 ? (
            <p className="text-center text-faded">The square is quiet right now — the first word could be yours.</p>
          ) : (
            <div>
              {posts.map((p) => (
                <Link key={p.id} href={`/community/${p.id}`} className="group flex items-baseline gap-4 py-5 border-b border-sand last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="display text-xl text-ink group-hover:text-terra transition-colors leading-snug">{p.title}</p>
                    <p className="text-sm text-faded mt-1">{authorOf(p)} · {timeAgo(p.created_at)}</p>
                  </div>
                  <Badge type={p.type} />
                </Link>
              ))}
            </div>
          )}
          <p className="text-center mt-10">
            <Link href="/community" className="text-terra underline underline-offset-4 decoration-terra/30 hover:decoration-terra transition-colors">
              Step into the community
            </Link>
          </p>
        </Reveal>
      </section>

      {/* Participate */}
      {opps.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pt-32 sm:pt-40">
          <Reveal>
            <p className="whisper text-terra text-lg text-center">Where money meets meaning</p>
            <h2 className="display text-4xl sm:text-5xl font-medium text-olive-deep mt-2 text-center">Open doors</h2>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            {opps.map((o) => (
              <Reveal key={o.id}>
                <Link href="/community/opportunities" className="group block rounded-[2rem] bg-sand/50 hover:bg-sand transition-colors p-10 h-full">
                  <p className="whisper text-terra">{oppTypeLabel[o.type] ?? o.type}</p>
                  <h3 className="display text-2xl font-medium text-olive-deep leading-snug mt-2">{o.title}</h3>
                  <p className="text-faded mt-3 line-clamp-2 leading-relaxed">{o.summary}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="text-center mt-10">
              <Link href="/community/opportunities" className="text-terra underline underline-offset-4 decoration-terra/30 hover:decoration-terra transition-colors">
                See every open door
              </Link>
            </p>
          </Reveal>
        </section>
      )}

      {/* Belonging → action */}
      <section className="mt-32 sm:mt-40 bg-olive-deep">
        <div className="mx-auto max-w-4xl px-6 py-28 sm:py-36 text-center">
          <Reveal slow>
            <p className="whisper text-sage text-lg">However you arrive</p>
            <h2 className="display text-4xl sm:text-6xl font-medium text-cream mt-3 leading-tight">
              There is a place for you here.
            </h2>
            <p className="mt-6 text-cream/70 max-w-md mx-auto leading-relaxed">
              Come for a weekend. Come for good. Or help from wherever you are — the village counts all of it.
            </p>
            <p className="mt-12">
              <Link href="/join" className="inline-block px-10 py-4 rounded-full bg-cream text-olive-deep font-medium hover:bg-white transition-colors">
                Join the village
              </Link>
            </p>
            <p className="mt-8 text-sm text-cream/50">
              <Link href="/guide" className="hover:text-cream/80 transition-colors underline underline-offset-4 decoration-cream/20">Plan a visit</Link>
              <span className="mx-3">·</span>
              <Link href="/community/opportunities" className="hover:text-cream/80 transition-colors underline underline-offset-4 decoration-cream/20">Restore a house</Link>
              <span className="mx-3">·</span>
              <Link href="/community" className="hover:text-cream/80 transition-colors underline underline-offset-4 decoration-cream/20">Just say hello</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
