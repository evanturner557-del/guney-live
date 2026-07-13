# Güney.live Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate Güney.live from ~12 public routes down to 4 (Home / Guide / Community / Join), drop the 34-language i18n system, evolve the visual system to a calm professional grid, add two Grok-generated visual assets, and pass a full end-to-end test gate before pushing to `main`.

**Architecture:** Next.js 16 App Router + Supabase (unchanged). Work proceeds file-cluster by file-cluster (each cluster = one nav destination), landing as one commit per task so `main` is never left mid-migration. This repo has no unit test framework (only ESLint) — the per-task test cycle is `npm run build` (type-check + compile) + `npm run lint`, plus a manual route smoke-check (`curl` against `npm run dev`, or a Playwright script for interactive flows). Task 11 runs the full interactive Playwright pass specified in the spec.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, Tailwind CSS v4 (`@theme` tokens in `globals.css`), Supabase (`@supabase/ssr`, `@supabase/supabase-js`), `react-markdown`, `hls.js`. Visual generation via `mcp__grok-mcp__generate_image`.

## Global Constraints

- Source repo: `~/Desktop/guney-live`, branch `main`, remote `evanturner557-del/guney-live`. Push directly to `main` when the Task 11 gate is clean (Evan confirmed no live-data risk, no branch/approval gate needed).
- English only — no i18n. Every string is a plain literal, no `t("...")` calls anywhere in `src/`.
- Design tokens are fixed and must not change: `--color-cream #faf6ef`, `--color-sand #f0e9db`, `--color-ink #2b2721`, `--color-faded #6f6759`, `--color-olive #5c6b3f`, `--color-olive-deep #43512c`, `--color-terra #b85c38`, `--color-terra-deep #9a4527`, `--color-sage #aab894`, `--font-display: "Fraunces"`, `--font-body: "Inter"`.
- Card pattern used everywhere from Task 2 onward: `rounded-2xl border border-sand bg-white p-5` (no `.corkboard`/`.note`/`.note-tilt-*`, no `rotate(...)`).
- Every route in the final nav (`/`, `/guide`, `/community`, `/join`) must build and render with zero console errors, signed-in and signed-out.
- Old routes (`/gallery`, `/gallery/[category]`, `/dashboard`, `/members`, `/opportunities`) must 30x-redirect, never 404.
- No content duplication across pages (gallery photos: Guide only. Profile editing: Join/Account only. Member directory: Community "Who's here" only.)
- Reference spec: `docs/superpowers/specs/2026-07-13-guney-live-redesign-design.md`.

---

## Task 1: Header + root layout — drop i18n scaffold, 4-link nav

**Files:**
- Modify: `src/components/Header.tsx` (full rewrite)
- Modify: `src/app/layout.tsx` (full rewrite)

**Interfaces:**
- Consumes: `signOut` from `@/app/actions` (unchanged signature, `() => Promise<void>` server action).
- Produces: `Header({ signedIn, name, isAdmin, avatarUrl })` — same prop contract as before, so no other call site changes. `RootLayout` no longer wraps children in `LanguageProvider`, no longer renders `WelcomeModal`.

- [ ] **Step 1: Rewrite `src/components/Header.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";

const links = [
  { href: "/guide", label: "Guide" },
  { href: "/community", label: "Community" },
  { href: "/join", label: "Join" },
];

export default function Header({ signedIn, name, isAdmin, avatarUrl }: { signedIn: boolean; name: string | null; isAdmin?: boolean; avatarUrl?: string | null }) {
  const pathname = usePathname();
  const [acct, setAcct] = useState(false);
  const initial = (name?.[0] ?? "").toUpperCase();
  const close = () => setAcct(false);

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-sand">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" onClick={close} className="display text-xl font-semibold text-olive-deep shrink-0">
          Güney<span className="text-terra">.live</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-olive text-cream" : "text-ink hover:bg-sand"
                }`}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            {signedIn ? (
              <button onClick={() => setAcct((a) => !a)} aria-label="Account"
                className="w-9 h-9 rounded-full bg-olive text-cream flex items-center justify-center font-semibold cursor-pointer hover:bg-olive-deep transition-colors overflow-hidden">
                {avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={avatarUrl} alt={name ?? "me"} className="w-full h-full object-cover" />
                  : (initial || "•")}
              </button>
            ) : (
              <Link href="/join" onClick={close} aria-label="Join"
                className="px-4 py-2 rounded-full bg-terra text-cream text-sm font-medium hover:bg-terra-deep transition-colors">
                Join
              </Link>
            )}
            {signedIn && acct && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-sand shadow-lg py-1.5 z-40">
                <p className="px-4 py-1.5 text-xs text-faded truncate">{name ?? "Member"}</p>
                <Link href="/join" onClick={close} className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors">My account</Link>
                {isAdmin && (
                  <Link href="/admin" onClick={close} className="block px-4 py-2.5 text-sm hover:bg-sand transition-colors text-olive-deep font-medium">⚙ Operations</Link>
                )}
                <form action={signOut}>
                  <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-sand transition-colors cursor-pointer">Sign out</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mobile nav row */}
      <nav className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                active ? "bg-olive text-cream" : "text-ink hover:bg-sand"
              }`}>
              {l.label}
            </Link>
          );
        })}
      </nav>

      {acct && <button aria-hidden tabIndex={-1} onClick={close} className="fixed inset-0 z-20 cursor-default" />}
    </header>
  );
}
```

- [ ] **Step 2: Rewrite `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guney.live — the digital home of Güney village",
  description:
    "The community platform for Güney (Yeşilova, Burdur, Turkey). What's happening, who needs help, what you can build — 8 km from Lake Salda.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let name: string | null = null;
  let isAdmin = false;
  let avatarUrl: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("name, is_admin, avatar_url").eq("id", user.id).maybeSingle();
    name = data?.name ?? null;
    isAdmin = Boolean(data?.is_admin);
    avatarUrl = data?.avatar_url ?? null;
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header signedIn={!!user} name={name} isAdmin={isAdmin} avatarUrl={avatarUrl} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-sand mt-16">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-faded flex flex-wrap gap-4 justify-between items-center">
            <p>Güney, Yeşilova, Burdur — the village, online.</p>
            <nav className="flex gap-4">
              <a href="/privacy" className="hover:text-ink">Privacy</a>
              <a href="/terms" className="hover:text-ink">Terms</a>
              <a href="mailto:support@guney.live" className="hover:text-ink">Contact</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: fails with module-not-found errors from `page.tsx`, `community/page.tsx`, `opportunities/page.tsx`, `guide/page.tsx`, `gallery/*`, `join/page.tsx`, `CategoryCovers.tsx`, `Dashboard.tsx` (they still import `@/lib/i18n` / `@/lib/lang-server` / `LanguageProvider`) — **this is expected at this point in the plan**; those files are rewritten in Tasks 3–7. Confirm the *only* errors are "Cannot find module" for those already-known files, nothing else (e.g. no error referencing `Header` or `layout.tsx` itself). Do not fix them here.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx src/app/layout.tsx
git commit -m "Redesign nav: 4 inline links, drop language picker and welcome modal from chrome"
```

---

## Task 2: Shared UI primitives + CSS cleanup

**Files:**
- Modify: `src/components/ui.tsx:1-33` (add `Card`, `PageHeader`)
- Modify: `src/app/globals.css` (remove corkboard/note/tilt blocks)

**Interfaces:**
- Produces: `Card({ children, className })` → `<div className="rounded-2xl border border-sand bg-white p-5 {className}">`. `PageHeader({ title, subtitle })` → standard `<h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">{title}</h1><p className="text-faded mt-2">{subtitle}</p>`. Both used by every task from Task 3 onward.

- [ ] **Step 1: Add primitives to `src/components/ui.tsx`** — insert after the imports (line 2), before `postTypeMeta`:

```tsx
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-sand bg-white p-5 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl">
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep">{title}</h1>
      {subtitle && <p className="text-faded mt-2">{subtitle}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Remove corkboard/note CSS from `src/app/globals.css`** — delete lines 35–63 and line 72 (the `.corkboard`, `.note`, `.note::before`, `.note-tilt-1/2/3/4` blocks). Keep everything else (`.prose-md`, `.led`/`led-pulse`, `.ws-*` weather scene, `.robot-*`) untouched.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: same known-file errors as Task 1 (page.tsx etc. still reference `.corkboard`/`.note-tilt-*` class names in JSX — harmless dead classes, not a compile error; confirm no *new* errors introduced by this task).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui.tsx src/app/globals.css
git commit -m "Add shared Card/PageHeader primitives, remove corkboard/pinned-note CSS"
```

---

## Task 3: Home page rewrite

**Files:**
- Modify: `src/app/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `Card`, `PageHeader`, `Badge`, `timeAgo`, `fmtEventDate`, `authorOf`, `type Post` from `@/components/ui` (Task 2); `Dashboard` from `@/components/Dashboard` (rewritten in Task 9 — until then it still expects a `t` prop, so Home passes a no-op identity translator `(k: string) => k` as a stopgap — see Step 1 note); `HeroSlideshow` from `@/components/HeroSlideshow` (unchanged); `VillageMap` from `@/components/VillageMap` (unchanged).
- Produces: no exports consumed elsewhere (page component).

- [ ] **Step 1: Rewrite `src/app/page.tsx`**

```tsx
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
```

Note: `<Dashboard ... />` is called here **without** a `t` prop. `Dashboard` still requires one until Task 9. Task 3's build will fail on this one line — that's expected and fixed by Task 9. Do not add a stopgap `t` prop; Task 9 removes the prop requirement entirely, so adding one here would just be thrown away.

- [ ] **Step 2: Partial build check**

Run: `npm run build 2>&1 | grep -A3 "app/page.tsx"`
Expected: the only error under `page.tsx` is the missing `t` prop to `<Dashboard>`. No i18n import errors (this file no longer imports `@/lib/i18n`/`@/lib/lang-server`), no other new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "Redesign Home: single clear hero message, drop corkboard/photo-pins, no gallery duplication"
```

---

## Task 4: Community tab bar + move Opportunities under Community

**Files:**
- Create: `src/components/CommunityTabs.tsx`
- Modify: `src/app/community/layout.tsx` (full rewrite)
- Create: `src/app/community/opportunities/page.tsx` (moved + de-i18n'd from `src/app/opportunities/page.tsx`)
- Create: `src/app/opportunities/page.tsx` (replaced with a redirect stub)
- Delete: `src/app/opportunities/layout.tsx`, `src/components/OpportunitiesNav.tsx`, `src/components/CommunityNav.tsx`

**Interfaces:**
- Produces: `CommunityTabs()` — client component, no props, reads `usePathname()`, renders a horizontal pill tab bar linking `/community`, `/community/chat`, `/community/marketplace`, `/community/opportunities`.
- Consumes: `oppTypeLabel` from `@/components/ui` (unchanged), `createOpportunity` from `@/app/actions` (unchanged), `Card`/`PageHeader` from Task 2.

- [ ] **Step 1: Create `src/components/CommunityTabs.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/community", label: "Feed" },
  { href: "/community/chat", label: "Chat" },
  { href: "/community/marketplace", label: "Marketplace" },
  { href: "/community/opportunities", label: "Opportunities" },
];

export default function CommunityTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 bg-sand/60 rounded-full p-1 overflow-x-auto">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              active ? "bg-white shadow-sm text-olive-deep" : "text-faded hover:text-ink"
            }`}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `src/app/community/layout.tsx`**

```tsx
import CommunityTabs from "@/components/CommunityTabs";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-5">
      <CommunityTabs />
      <div>{children}</div>
    </div>
  );
}
```

(The signed-in "Your Corner" panel is added above `<CommunityTabs />` in Task 5 — this step only lands the tab bar.)

- [ ] **Step 3: Create `src/app/community/opportunities/page.tsx`** (moved from `src/app/opportunities/page.tsx`, i18n stripped, `PageHeader`/`Card` adopted)

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createOpportunity } from "@/app/actions";
import { Md, oppTypeLabel, PageHeader, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const active = type && oppTypeLabel[type] ? type : "all";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let q = supabase.from("opportunities").select("*").neq("status", "closed").order("created_at", { ascending: false });
  if (active !== "all") q = q.eq("type", active);
  const { data: opps } = await q;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Opportunities" subtitle="What you can build, join or improve in Güney — land, houses, businesses, skills, projects." />

      {user ? (
        <details className="mt-6 bg-white rounded-xl border border-sand">
          <summary className="cursor-pointer px-5 py-4 font-medium text-olive-deep select-none">＋ Post an opportunity</summary>
          <form action={createOpportunity} className="px-5 pb-5 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <select name="type" className="border border-sand rounded-lg px-3 py-2 text-sm bg-cream" defaultValue="collaboration">
                {Object.entries(oppTypeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input name="title" required placeholder="Title" maxLength={120} className="flex-1 min-w-48 border border-sand rounded-lg px-3 py-2 text-sm" />
            </div>
            <input name="summary" required placeholder="One-line summary" maxLength={200} className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <textarea name="details" rows={4} placeholder="Details — what it is, what's needed, how to act on it" className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <input name="contact" placeholder="Contact (optional — email, phone, or 'message me here')" className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <button className="px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">Post opportunity</button>
          </form>
        </details>
      ) : (
        <p className="mt-6 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">Join</Link> to post opportunities and respond to them.
        </p>
      )}

      <div className="space-y-4 mt-8">
        {(opps ?? []).length === 0 && <p className="text-faded text-sm py-8">No open opportunities in this category yet.</p>}
        {(opps ?? []).map((o) => (
          <Card key={o.id} className="p-0 overflow-hidden">
            <details className="group">
              <summary className="cursor-pointer p-5 select-none list-none">
                <span className="text-xs font-medium text-terra-deep">{oppTypeLabel[o.type] ?? o.type}</span>
                {o.status === "in_progress" && (
                  <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-sage/30 text-olive-deep">in progress</span>
                )}
                <h3 className="font-semibold text-lg leading-snug mt-1">{o.title}</h3>
                <p className="text-[15px] text-faded mt-1">{o.summary}</p>
                <p className="text-xs text-terra mt-2 group-open:hidden">Read more ↓</p>
              </summary>
              <div className="px-5 pb-5 border-t border-sand pt-4">
                {o.details && <Md>{o.details}</Md>}
                {o.contact && <p className="text-sm mt-2"><strong>Contact:</strong> {o.contact}</p>}
                {!o.contact && (
                  <p className="text-sm text-faded mt-2">
                    Interested? Post in the <Link href="/community" className="text-terra hover:underline">Community</Link> and the village will point you to the right person.
                  </p>
                )}
              </div>
            </details>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Replace `src/app/opportunities/page.tsx` with a redirect stub, delete its layout**

```tsx
import { redirect } from "next/navigation";

export default function OldOpportunitiesPage() {
  redirect("/community/opportunities");
}
```

```bash
rm /Users/evrimbey/Desktop/guney-live/src/app/opportunities/layout.tsx
rm /Users/evrimbey/Desktop/guney-live/src/components/OpportunitiesNav.tsx
rm /Users/evrimbey/Desktop/guney-live/src/components/CommunityNav.tsx
```

- [ ] **Step 5: Update `createOpportunity` revalidate path in `src/app/actions.ts:63`**

Change `revalidatePath("/opportunities");` to `revalidatePath("/community/opportunities");`

- [ ] **Step 6: Build + route check**

Run: `npm run build`
Expected: no errors under `community/opportunities`, `opportunities/page.tsx`, `CommunityTabs.tsx`, `community/layout.tsx`. (`community/page.tsx`, `community/chat/page.tsx`, `community/marketplace/page.tsx` still compile fine unmodified — chat/marketplace never used i18n.)

Run: `npm run dev` then `curl -sI http://localhost:3000/opportunities | head -1`
Expected: `HTTP/1.1 307 Temporary Redirect` (or 308) to `/community/opportunities`.

- [ ] **Step 7: Commit**

```bash
git add -A src/app/community/opportunities src/app/opportunities src/components/CommunityTabs.tsx src/app/community/layout.tsx src/app/actions.ts
git rm src/app/opportunities/layout.tsx src/components/OpportunitiesNav.tsx src/components/CommunityNav.tsx
git commit -m "Move Opportunities under Community as a tab; replace side-nav components with CommunityTabs"
```

---

## Task 5: Community feed page — drop i18n

**Files:**
- Modify: `src/app/community/page.tsx` (full rewrite)

**Interfaces:** Consumes `PageHeader`/`Card` (Task 2, `Card` optional here), `createPost` from `@/app/actions` (unchanged), `PostCard`/`postTypeMeta`/`type Post` from `@/components/ui` (unchanged).

- [ ] **Step 1: Rewrite `src/app/community/page.tsx`**

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "@/app/actions";
import { PostCard, postTypeMeta, PageHeader, type Post } from "@/components/ui";

export const dynamic = "force-dynamic";

const filters = ["all", "update", "event", "notice", "help"] as const;
const heading: Record<string, string> = {
  all: "Public notices", update: "Updates", event: "Events", notice: "Notices", help: "Help needed",
};

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const active = filters.includes((type ?? "all") as (typeof filters)[number]) ? (type ?? "all") : "all";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let q = supabase.from("posts").select("*, profiles(name)")
    .order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(50);
  if (active !== "all") q = q.eq("type", active);
  const { data } = await q;
  const posts = (data ?? []) as Post[];

  return (
    <div>
      <PageHeader title={heading[active]} subtitle="Daily life in Güney — updates, events, notices, and people who need a hand." />

      <div className="flex gap-2 flex-wrap mt-4">
        {filters.map((f) => (
          <Link key={f} href={f === "all" ? "/community" : `/community?type=${f}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              active === f ? "bg-olive text-cream" : "bg-sand/60 text-faded hover:text-ink"
            }`}>
            {heading[f]}
          </Link>
        ))}
      </div>

      {user ? (
        <details className="mt-5 bg-white rounded-xl border border-sand">
          <summary className="cursor-pointer px-5 py-4 font-medium text-olive-deep select-none">＋ Share something with the village</summary>
          <form action={createPost} className="px-5 pb-5 space-y-3">
            <div className="flex gap-3 flex-wrap">
              <select name="type" className="border border-sand rounded-lg px-3 py-2 text-sm bg-cream" defaultValue={active === "all" ? "update" : active}>
                <option value="update">Update</option><option value="event">Event</option>
                <option value="notice">Notice</option><option value="help">Help needed</option>
              </select>
              <input name="title" required placeholder="Title" maxLength={120} className="flex-1 min-w-48 border border-sand rounded-lg px-3 py-2 text-sm" />
            </div>
            <textarea name="body" required rows={4} placeholder="What's happening?" className="w-full border border-sand rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-3 flex-wrap text-sm">
              <label className="flex items-center gap-2 text-faded">Event date <input type="datetime-local" name="event_date" className="border border-sand rounded-lg px-2 py-1.5" /></label>
              <input name="event_location" placeholder="Event location (optional)" className="border border-sand rounded-lg px-3 py-1.5 flex-1 min-w-40" />
            </div>
            <button className="px-5 py-2 rounded-full bg-olive text-cream text-sm font-medium hover:bg-olive-deep cursor-pointer">Post</button>
          </form>
        </details>
      ) : (
        <p className="mt-5 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">Join the community</Link> to post, sell, and chat.
        </p>
      )}

      <div className="space-y-3 mt-6">
        {posts.length === 0 && <p className="text-faded text-sm py-8">Nothing under {postTypeMeta[active as keyof typeof postTypeMeta]?.label ?? "here"} yet.</p>}
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

Run: `npm run build 2>&1 | grep "community/page.tsx"`
Expected: no output (no errors for this file).

- [ ] **Step 3: Commit**

```bash
git add src/app/community/page.tsx
git commit -m "Community feed: drop i18n, add inline filter pills under the new tab bar"
```

---

## Task 6: Your Corner panel (replaces /dashboard + /members)

**Files:**
- Create: `src/components/YourCorner.tsx`
- Modify: `src/app/community/layout.tsx` (add signed-in panel above tabs)
- Create: `src/app/dashboard/page.tsx` (replaced with redirect stub)
- Create: `src/app/members/page.tsx` (replaced with redirect stub)

**Interfaces:**
- Produces: `YourCorner({ userId })` — async server component, `{ userId: string }`, fetches everything itself (profile, posts, listings, photos, comments, all-members) via `createClient()` from `@/lib/supabase/server`, renders the tier/points header, checklist, inbox, and "Who's here" expandable directory. No return value consumed elsewhere.
- Consumes: `AvatarEdit` (`@/components/AvatarEdit`, unchanged), `Badge`/`timeAgo` (`@/components/ui`).

- [ ] **Step 1: Create `src/components/YourCorner.tsx`**

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AvatarEdit from "@/components/AvatarEdit";
import { Badge, timeAgo } from "@/components/ui";

const connLabel: Record<string, string> = {
  villager: "Villager", diaspora: "Diaspora", newcomer: "Newcomer", visitor: "Visitor",
};

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

export default async function YourCorner({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data: me }, { data: allMembers }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("profiles").select("id,name,connection,avatar_url").order("created_at"),
  ]);

  const [myPosts, myListings, myPhotos] = await Promise.all([
    supabase.from("posts").select("id,type,title,created_at,flagged").eq("author_id", userId).order("created_at", { ascending: false }),
    supabase.from("listings").select("id,kind,title,status,created_at").eq("seller_id", userId).order("created_at", { ascending: false }),
    supabase.from("photos").select("id,url,category,created_at").eq("uploaded_by", userId).order("created_at", { ascending: false }),
  ]);
  const posts = myPosts.data ?? [], listings = myListings.data ?? [], photos = myPhotos.data ?? [];

  let comments: { id: string; body: string; author_name: string | null; post_id: string; created_at: string }[] = [];
  if (posts.length) {
    const { data } = await supabase.from("comments")
      .select("id,body,author_name,post_id,created_at,author_id")
      .in("post_id", posts.map((p) => p.id)).neq("author_id", userId)
      .order("created_at", { ascending: false }).limit(5);
    comments = (data ?? []) as typeof comments;
  }

  const points = posts.length * 5 + photos.length * 3 + listings.length * 2 + comments.length;
  const { cur, next } = tierFor(points);
  const pct = next ? Math.min(100, Math.round(((points - cur.min) / (next.min - cur.min)) * 100)) : 100;

  const checklist = [
    { label: "Add a profile photo", done: Boolean(me?.avatar_url) },
    { label: "Write a short bio", done: Boolean(me?.bio) },
    { label: "List a skill you can offer", done: Boolean(me?.skills) },
    { label: "Share your first photo", done: photos.length > 0 },
    { label: "Post your first update", done: posts.length > 0 },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const members = allMembers ?? [];

  return (
    <details open className="rounded-2xl border border-sand overflow-hidden">
      <summary className="cursor-pointer list-none bg-gradient-to-br from-olive to-olive-deep text-cream p-5">
        <div className="flex items-center gap-4">
          <AvatarEdit userId={userId} name={me?.name ?? null} avatarUrl={me?.avatar_url ?? null} />
          <div className="min-w-0">
            <p className="text-sage text-sm">Your corner,</p>
            <h2 className="display text-xl sm:text-2xl font-semibold leading-tight truncate">{me?.name ?? "friend"}</h2>
            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-black/20">{connLabel[me?.connection ?? "newcomer"]}</span>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-2xl">{cur.icon}</p>
            <p className="text-xs font-medium">{cur.name} · {points} pts</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-sage mb-1">
            <span>{cur.icon} {cur.name}</span>
            {next ? <span>{next.min - points} pts to {next.icon} {next.name}</span> : <span>Top tier — thank you 💛</span>}
          </div>
          <div className="h-2 rounded-full bg-black/25 overflow-hidden">
            <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </summary>

      <div className="grid sm:grid-cols-3 gap-3 p-4 bg-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">Getting started · {doneCount}/{checklist.length}</p>
          <div className="space-y-1.5">
            {checklist.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${c.done ? "bg-olive text-cream" : "border border-sand"}`}>{c.done ? "✓" : ""}</span>
                <span className={c.done ? "text-faded line-through" : ""}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">Your inbox</p>
          {comments.length === 0 ? (
            <p className="text-sm text-faded">No replies yet.</p>
          ) : (
            <div className="space-y-1.5">
              {comments.map((c) => (
                <Link key={c.id} href={`/community/${c.post_id}`} className="block bg-sand/40 rounded-lg px-3 py-2 hover:bg-sand transition-colors">
                  <p className="text-[13px]"><span className="font-medium">{c.author_name ?? "Someone"}</span> replied</p>
                  <p className="text-xs text-faded truncate">{c.body}</p>
                  <p className="text-[10px] text-faded mt-0.5">{timeAgo(c.created_at)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">Who&apos;s here · {members.length}</p>
          <details className="group">
            <summary className="cursor-pointer list-none flex -space-x-2">
              {members.slice(0, 6).map((m) => (
                <span key={m.id} className="w-8 h-8 rounded-full bg-sage/40 ring-2 ring-white flex items-center justify-center display text-xs font-semibold text-olive-deep overflow-hidden">
                  {m.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={m.avatar_url} alt={m.name ?? ""} className="w-full h-full object-cover" />
                    : (m.name?.[0]?.toUpperCase() ?? "?")}
                </span>
              ))}
              <span className="text-xs text-terra self-center ml-3 group-open:hidden">See all →</span>
            </summary>
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm py-1">
                  <span className="w-6 h-6 rounded-full bg-sage/40 flex items-center justify-center text-[10px] font-semibold text-olive-deep shrink-0">{m.name?.[0]?.toUpperCase() ?? "?"}</span>
                  <span className="truncate">{m.name}</span>
                  <span className="text-[11px] text-faded ml-auto">{connLabel[m.connection] ?? m.connection}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      {(posts.length > 0 || listings.length > 0) && (
        <div className="px-4 pb-4 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-faded mb-2">Things you&apos;ve made</p>
          <div className="space-y-1">
            {posts.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/community/${p.id}`} className="flex items-center gap-2 text-sm hover:text-terra">
                <Badge type={p.type} />
                <span className="flex-1 truncate">{p.title}</span>
                {p.flagged && <span className="text-[10px] text-amber-700" title="Held for review">⚑</span>}
              </Link>
            ))}
            {listings.slice(0, 3).map((l) => (
              <Link key={l.id} href="/community/marketplace" className="flex items-center gap-2 text-sm hover:text-terra">
                <span className="text-[10px] uppercase text-faded w-14 shrink-0">{l.kind}</span>
                <span className="flex-1 truncate">{l.title}</span>
                <span className="text-[11px] text-faded">{l.status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </details>
  );
}
```

- [ ] **Step 2: Modify `src/app/community/layout.tsx`** to render it above the tabs when signed in

```tsx
import { createClient } from "@/lib/supabase/server";
import CommunityTabs from "@/components/CommunityTabs";
import YourCorner from "@/components/YourCorner";

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-5">
      {user && <YourCorner userId={user.id} />}
      <CommunityTabs />
      <div>{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/app/dashboard/page.tsx` and `src/app/members/page.tsx` with redirect stubs**

```tsx
// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";

export default function OldDashboardPage() {
  redirect("/community");
}
```

```tsx
// src/app/members/page.tsx
import { redirect } from "next/navigation";

export default function OldMembersPage() {
  redirect("/community");
}
```

- [ ] **Step 4: Update `updateProfile` revalidate path in `src/app/actions.ts:77`**

Change `revalidatePath("/members"); revalidatePath("/dashboard");` to `revalidatePath("/community"); revalidatePath("/join");`

- [ ] **Step 5: Build + route check**

Run: `npm run build`
Expected: no errors for `YourCorner.tsx`, `community/layout.tsx`, `dashboard/page.tsx`, `members/page.tsx`.

Run: `npm run dev` then `curl -sI http://localhost:3000/dashboard | head -1` and `curl -sI http://localhost:3000/members | head -1`
Expected: both `307`/`308` redirects to `/community`.

- [ ] **Step 6: Commit**

```bash
git add src/components/YourCorner.tsx src/app/community/layout.tsx src/app/dashboard/page.tsx src/app/members/page.tsx src/app/actions.ts
git commit -m "Add Your Corner panel to Community (replaces standalone /dashboard and /members)"
```

---

## Task 7: Guide + Gallery merge

**Files:**
- Modify: `src/components/CategoryCovers.tsx` (drop `t` prop)
- Modify: `src/app/guide/page.tsx` (full rewrite — adds Photos section)
- Create: `src/app/guide/gallery/[category]/page.tsx` (moved from `src/app/gallery/[category]/page.tsx`)
- Create: `src/app/gallery/page.tsx` (replaced with redirect stub)
- Create: `src/app/gallery/[category]/page.tsx` (replaced with redirect stub)

**Interfaces:**
- Produces: `CategoryCovers({ stats })` — drops the `t` param entirely, uses `CATEGORIES` names/blurbs directly (already plain English in `@/lib/categories.ts`), links to `/guide/gallery/${key}` instead of `/gallery/${key}`.

- [ ] **Step 1: Rewrite `src/components/CategoryCovers.tsx`**

```tsx
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export type CatStat = { count: number; cover: string | null };

export default function CategoryCovers({ stats }: { stats: Record<string, CatStat> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {CATEGORIES.map((c) => {
        const s = stats[c.key] ?? { count: 0, cover: null };
        return (
          <Link key={c.key} href={`/guide/gallery/${c.key}`}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-sand group block">
            {s.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.cover} alt={c.name} loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${c.grad} flex items-center justify-center`}>
                <span className="text-4xl opacity-80">{c.emoji}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/70">{c.emoji} category</p>
                  <h3 className="font-semibold text-lg leading-tight">{c.name}</h3>
                </div>
                <span className="shrink-0 w-8 h-8 rounded-full bg-white/90 text-ink flex items-center justify-center text-lg font-semibold group-hover:bg-terra group-hover:text-cream transition-colors">+</span>
              </div>
              <p className="text-[11px] text-white/80 mt-1">
                {s.count > 0 ? `${s.count} ${s.count > 1 ? "photos" : "photo"}` : "Add the first photo"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `src/app/guide/page.tsx`** — adds a "Photos" `NavSection` + inline `CategoryCovers` grid

```tsx
import { createClient } from "@/lib/supabase/server";
import { Md, PageHeader } from "@/components/ui";
import { NavCard, NavSection, NavAnchor } from "@/components/SideNav";
import CategoryCovers, { type CatStat } from "@/components/CategoryCovers";
import { CATEGORIES } from "@/lib/categories";

const catIcon: Record<string, string> = {
  "getting-here": "🧭", staying: "🛏️", living: "🏡", nature: "🌿", services: "☎️", faq: "❓",
};
const catMeta: Record<string, { title: string; blurb: string }> = {
  "getting-here": { title: "Getting here", blurb: "Where Güney is and how to reach it." },
  staying: { title: "Visiting & staying", blurb: "Beds, food, and what to do." },
  living: { title: "Living here", blurb: "Internet, healthcare, schools, property, seasons." },
  nature: { title: "Nature", blurb: "Lake Salda and the landscape around the village." },
  services: { title: "Services & contacts", blurb: "Who to call, how to move around." },
  faq: { title: "Questions", blurb: "The things everyone asks." },
};
const catOrder = ["getting-here", "staying", "living", "nature", "services", "faq"];

export const revalidate = 3600;

export default async function GuidePage() {
  const supabase = await createClient();
  const [{ data: articleRows }, { data: photoRows }] = await Promise.all([
    supabase.from("guide_articles").select("*").order("category").order("sort"),
    supabase.from("photos").select("category, url, created_at").order("created_at", { ascending: false }),
  ]);
  const articles = articleRows ?? [];
  const byCat = catOrder
    .map((c) => ({ cat: c, items: articles.filter((a) => a.category === c) }))
    .filter((g) => g.items.length > 0);

  const stats: Record<string, CatStat> = {};
  for (const c of CATEGORIES) stats[c.key] = { count: 0, cover: null };
  for (const r of photoRows ?? []) {
    const k = (r.category as string) ?? "village";
    if (!stats[k]) stats[k] = { count: 0, cover: null };
    stats[k].count += 1;
    if (!stats[k].cover) stats[k].cover = r.url as string;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="max-w-2xl">
        <PageHeader title="The Guide" subtitle="Everything practical about visiting and living in Güney, and the village in pictures — no marketing, just what's useful." />
        <p className="mt-3">
          <a href="https://www.google.com/maps/search/?api=1&query=G%C3%BCney%2C+Ye%C5%9Filova%2C+Burdur" target="_blank" rel="noopener noreferrer" className="text-sm text-terra hover:underline">
            Open Güney in Google Maps →
          </a>
        </p>
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-6 mt-10">
        <nav className="hidden md:block sticky top-20 self-start w-full">
          <NavCard>
            <NavSection icon="📖" title="Guide">
              {byCat.map((g) => (
                <NavAnchor key={g.cat} href={`#${g.cat}`} icon={catIcon[g.cat] ?? "•"} label={catMeta[g.cat].title} />
              ))}
            </NavSection>
            <NavSection icon="🖼️" title="Photos">
              <NavAnchor href="#photos" icon="📷" label="The village in pictures" />
            </NavSection>
          </NavCard>
        </nav>

        <div className="space-y-12 max-w-2xl">
          {byCat.map((g) => (
            <section key={g.cat} id={g.cat} className="scroll-mt-20">
              <h2 className="display text-2xl font-semibold text-olive-deep">{catMeta[g.cat].title}</h2>
              <p className="text-sm text-faded mb-4">{catMeta[g.cat].blurb}</p>
              <div className="space-y-3">
                {g.items.map((a) => (
                  <details key={a.id} className="bg-white rounded-xl border border-sand" open={g.items.length === 1}>
                    <summary className="cursor-pointer px-5 py-4 font-medium select-none">{a.title}</summary>
                    <div className="px-5 pb-5"><Md>{a.body}</Md></div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <section id="photos" className="scroll-mt-20">
            <h2 className="display text-2xl font-semibold text-olive-deep">The village in pictures</h2>
            <p className="text-sm text-faded mb-4">Güney and Lake Salda, by place. Tap a category to look inside, or open it and add your own.</p>
            <CategoryCovers stats={stats} />
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/guide/gallery/[category]/page.tsx`** (moved from `src/app/gallery/[category]/page.tsx`, i18n stripped, `/gallery` links → `/guide`)

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Gallery, { type Photo } from "@/components/Gallery";
import PhotoUpload from "@/components/PhotoUpload";
import VillageMap from "@/components/VillageMap";
import { catByKey, CATEGORIES } from "@/lib/categories";
import { poisByCat } from "@/lib/pois";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.key }));
}

export default async function GuideCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = catByKey(category);
  if (!cat) notFound();
  const pois = poisByCat(category);

  const supabase = await createClient();
  const [{ data: { user } }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("photos").select("*").eq("category", category).order("created_at", { ascending: false }),
  ]);
  const photos = (data ?? []) as Photo[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/guide#photos" className="text-sm text-terra hover:underline">← All categories</Link>
      <h1 className="display text-3xl sm:text-4xl font-semibold text-olive-deep mt-3">{cat.emoji} {cat.name}</h1>
      <p className="text-faded mt-2 max-w-2xl">{cat.blurb}</p>

      {pois.length > 0 && (
        <div className="mt-6">
          <VillageMap pois={pois} center={[pois[0].lat, pois[0].lng]} zoom={12} height={240} controls={false} />
          <p className="text-xs text-faded mt-1.5">On the map: {pois.map((p) => `${p.emoji} ${p.name}`).join(" · ")}. Tap a pin for directions.</p>
        </div>
      )}

      {user ? (
        <div className="mt-6"><PhotoUpload userId={user.id} category={cat.key} /></div>
      ) : (
        <p className="mt-6 bg-sand/60 rounded-xl px-5 py-4 text-sm">
          <Link href="/join" className="text-terra font-medium hover:underline">Join</Link> to add photos to {cat.name}.
        </p>
      )}

      <div className="mt-8">
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-sand/40 rounded-2xl">
            <p className="text-4xl mb-2">{cat.emoji}</p>
            <p className="font-medium text-olive-deep">No photos here yet</p>
            <p className="text-sm text-faded mt-1 max-w-md mx-auto">
              This corner of the archive is waiting for the village. If you have photos of {cat.name.toLowerCase()},
              {user ? " add them above." : " join and add them."}
            </p>
          </div>
        ) : (
          <Gallery photos={photos} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Replace `src/app/gallery/page.tsx` and `src/app/gallery/[category]/page.tsx` with redirect stubs**

```tsx
// src/app/gallery/page.tsx
import { redirect } from "next/navigation";

export default function OldGalleryPage() {
  redirect("/guide#photos");
}
```

```tsx
// src/app/gallery/[category]/page.tsx
import { redirect } from "next/navigation";

export default async function OldGalleryCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  redirect(`/guide/gallery/${category}`);
}
```

- [ ] **Step 5: Build + route check**

Run: `npm run build`
Expected: no errors under `guide/`, `gallery/`, `CategoryCovers.tsx`.

Run: `npm run dev` then `curl -sI http://localhost:3000/gallery/salda | head -1`
Expected: redirect to `/guide/gallery/salda`.

- [ ] **Step 6: Commit**

```bash
git add -A src/app/guide src/app/gallery src/components/CategoryCovers.tsx
git commit -m "Merge Gallery into Guide (Photos section + /guide/gallery/[category]); drop i18n from both"
```

---

## Task 8: Join/Account — drop i18n, add signed-in Account view

**Files:**
- Modify: `src/app/join/page.tsx` (full rewrite)

**Interfaces:** Consumes `updateProfile`, `signOut` from `@/app/actions` (unchanged), `AvatarEdit` from `@/components/AvatarEdit` (unchanged).

- [ ] **Step 1: Rewrite `src/app/join/page.tsx`**

```tsx
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

function OAuthButtons({ onError }: { onError: (m: string) => void }) {
  async function oauth(provider: "google" | "facebook") {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/community` },
    });
    if (error) onError(error.message);
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={() => oauth("google")}
        className="flex items-center justify-center gap-2 border border-sand rounded-full py-2.5 text-sm font-medium hover:bg-sand transition-colors cursor-pointer">
        <span className="text-base">🇬</span> Google
      </button>
      <button type="button" onClick={() => oauth("facebook")}
        className="flex items-center justify-center gap-2 border border-sand rounded-full py-2.5 text-sm font-medium hover:bg-sand transition-colors cursor-pointer">
        <span className="text-base">f</span> Facebook
      </button>
    </div>
  );
}

function JoinInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [connection, setConnection] = useState("newcomer");
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(false);
  const [notify, setNotify] = useState(true);
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setState("loading"); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setState("error"); return; }
    window.location.href = "/community";
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) { setError("Please accept the terms and cookie policy to continue."); setState("error"); return; }
    setState("loading"); setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/community`,
        data: { name, connection, phone, notify },
      },
    });
    if (error) { setError(error.message); setState("error"); return; }
    if (data.session) { window.location.href = "/community"; return; }
    setState("sent");
  }

  async function magicLink() {
    if (!email) { setError("Enter your email first."); setState("error"); return; }
    setState("loading"); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/community` },
    });
    if (error) { setError(error.message); setState("error"); return; }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <Shell>
        <div className="bg-white rounded-2xl border border-sand p-8 text-center">
          <p className="text-2xl mb-2">📬</p>
          <h2 className="display text-xl font-semibold">Check your email</h2>
          <p className="text-faded text-sm mt-2">
            We sent a message to <strong className="text-ink">{email}</strong>. Open it on this device to finish.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex bg-sand/60 rounded-full p-1 mb-6 text-sm font-medium">
        <button onClick={() => { setMode("signin"); setState("idle"); }}
          className={`flex-1 py-2 rounded-full transition-colors ${mode === "signin" ? "bg-white shadow-sm text-olive-deep" : "text-faded cursor-pointer"}`}>Sign in</button>
        <button onClick={() => { setMode("signup"); setState("idle"); }}
          className={`flex-1 py-2 rounded-full transition-colors ${mode === "signup" ? "bg-white shadow-sm text-olive-deep" : "text-faded cursor-pointer"}`}>Create account</button>
      </div>

      <div className="bg-white rounded-2xl border border-sand p-6 sm:p-8">
        <OAuthButtons onError={(m) => { setError(m); setState("error"); }} />
        <div className="flex items-center gap-3 my-5 text-xs text-faded">
          <span className="flex-1 h-px bg-sand" /> or with email <span className="flex-1 h-px bg-sand" />
        </div>

        {mode === "signin" ? (
          <form onSubmit={signIn} className="space-y-3">
            <Field label="Email"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} /></Field>
            <Field label="Password"><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} /></Field>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-olive" />
                <span className="text-faded">Keep me signed in</span>
              </label>
              <Link href="/auth/forgot" className="text-terra hover:underline">Forgot password?</Link>
            </div>
            <button disabled={state === "loading"} className={btnCls}>{state === "loading" ? "Signing in…" : "Sign in"}</button>
            <button type="button" onClick={magicLink} className="w-full text-xs text-faded hover:text-ink py-1">or email me a one-time sign-in link instead</button>
          </form>
        ) : (
          <form onSubmit={signUp} className="space-y-3">
            <Field label="Your name"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="How the village should know you" className={inputCls} /></Field>
            <Field label="Email"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} /></Field>
            <Field label="Password"><input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputCls} /></Field>
            <Field label="Your connection to Güney">
              <select value={connection} onChange={(e) => setConnection(e.target.value)} className={`${inputCls} bg-white`}>
                <option value="villager">I live in or near the village</option>
                <option value="diaspora">My family comes from Güney</option>
                <option value="newcomer">I want to move / build something here</option>
                <option value="visitor">I&apos;m visiting or just curious</option>
              </select>
            </Field>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-3.5">
              <label className="block text-sm">
                <span className="flex items-center gap-2 font-medium text-olive-deep">
                  <span className="text-base">📱</span> Phone (optional — for direct messages later)
                </span>
                <span className="block text-[12px] text-faded mt-0.5 mb-2">Only used for village contact, never shown publicly.</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx"
                  className="w-full border border-olive/30 rounded-lg px-3 py-2.5 text-sm bg-white" />
              </label>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-olive mt-0.5" />
                <span className="text-faded">I agree to the <Link href="/terms" className="text-terra underline">terms</Link> and <Link href="/privacy" className="text-terra underline">privacy policy</Link>, and the use of cookies to keep me signed in.</span>
              </label>
              <label className="flex items-start gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-olive mt-0.5" />
                <span className="text-faded">Email me about village news and replies (you can turn this off anytime).</span>
              </label>
            </div>

            <button disabled={state === "loading"} className={btnCls}>{state === "loading" ? "Creating…" : "Create account"}</button>
          </form>
        )}

        {state === "error" && <p className="text-sm text-red-700 mt-3">{error}</p>}
      </div>

      <p className="text-xs text-faded mt-4 text-center">
        {mode === "signin" ? "New to Güney? " : "Already a member? "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-terra hover:underline cursor-pointer">
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </Shell>
  );
}

const inputCls = "mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm";
const btnCls = "w-full py-3 rounded-full bg-terra text-cream font-medium hover:bg-terra-deep transition-colors cursor-pointer disabled:opacity-60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="font-medium">{label}</span>{children}</label>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="display text-3xl font-semibold text-olive-deep text-center">Welcome to Güney</h1>
      <p className="text-faded mt-2 mb-8 text-center text-sm">The village, online — for those who live here, come from here, or are drawn to it.</p>
      {children}
    </div>
  );
}

export default function JoinPage() {
  return <Suspense fallback={<Shell><div /></Shell>}><JoinInner /></Suspense>;
}
```

Note: this task keeps `/join` **always** rendering the sign-in/up form (client component, no server-side signed-in check yet). The signed-in "Account" branch is added in **Task 8b** below as a small, separately testable follow-up, because it requires converting the route boundary to check auth server-side first — doing both in one step would conflate two different failure modes if the build breaks.

- [ ] **Step 2: Build check**

Run: `npm run build 2>&1 | grep "join/page.tsx"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/join/page.tsx
git commit -m "Join: drop i18n from sign-in/up form"
```

### Task 8b: Join → Account when signed in

**Files:**
- Create: `src/app/join/JoinForm.tsx` (the client component from Task 8, moved out verbatim so `page.tsx` can be a server component)
- Modify: `src/app/join/page.tsx` (becomes a server component that branches on auth)
- Create: `src/components/AccountPanel.tsx` (profile edit form, moved from the old `/dashboard`/`/members` profile forms)

- [ ] **Step 1: Move the entire contents of Task 8's `src/app/join/page.tsx` into a new file `src/app/join/JoinForm.tsx`**, keeping the `"use client"` directive and every export, but rename the default export from `JoinPage` to `JoinForm`:

```bash
git mv src/app/join/page.tsx src/app/join/JoinForm.tsx
```

Then edit the last 3 lines of `JoinForm.tsx` from:
```tsx
export default function JoinPage() {
  return <Suspense fallback={<Shell><div /></Shell>}><JoinInner /></Suspense>;
}
```
to:
```tsx
export default function JoinForm() {
  return <Suspense fallback={<Shell><div /></Shell>}><JoinInner /></Suspense>;
}
```

- [ ] **Step 2: Create `src/components/AccountPanel.tsx`**

```tsx
import { updateProfile } from "@/app/actions";
import { signOut } from "@/app/actions";
import AvatarEdit from "@/components/AvatarEdit";

const connLabel: Record<string, string> = {
  villager: "Villager", diaspora: "Diaspora", newcomer: "Newcomer", visitor: "Visitor",
};

export default function AccountPanel({ me, email }: {
  me: { name: string | null; bio: string | null; connection: string | null; skills: string | null; phone: string | null; avatar_url: string | null } | null;
  email: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="display text-3xl font-semibold text-olive-deep text-center">Your account</h1>
      <p className="text-faded mt-2 mb-8 text-center text-sm">{email}</p>

      <div className="bg-white rounded-2xl border border-sand p-6 sm:p-8 space-y-5">
        <div className="flex justify-center">
          <AvatarEdit userId="" name={me?.name ?? null} avatarUrl={me?.avatar_url ?? null} />
        </div>

        <form action={updateProfile} className="space-y-3">
          <label className="block text-sm">
            <span className="font-medium">Name</span>
            <input name="name" required defaultValue={me?.name ?? ""} className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Your connection to Güney</span>
            <select name="connection" defaultValue={me?.connection ?? "newcomer"} className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm bg-white">
              {Object.entries(connLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Bio</span>
            <textarea name="bio" rows={2} defaultValue={me?.bio ?? ""} placeholder="A line about you and your connection to the village" className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Skills you can offer</span>
            <input name="skills" defaultValue={me?.skills ?? ""} placeholder="e.g. building, translation, farming, design" className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Phone (private)</span>
            <input name="phone" defaultValue={me?.phone ?? ""} className="mt-1 w-full border border-sand rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <button className="w-full py-3 rounded-full bg-olive text-cream font-medium hover:bg-olive-deep transition-colors cursor-pointer">Save profile</button>
        </form>

        <form action={signOut}>
          <button className="w-full py-2.5 rounded-full border border-sand text-sm text-faded hover:bg-sand transition-colors cursor-pointer">Sign out</button>
        </form>
      </div>
    </div>
  );
}
```

Note: `AvatarEdit` requires a real `userId` prop to upload correctly — `page.tsx` (Step 3) passes it through; the empty string above is a placeholder only inside this isolated snippet and must not ship. **Step 3 wires the real `user.id` in.** Do not skip Step 3.

- [ ] **Step 3: Rewrite `src/app/join/page.tsx`** as a server component that branches

```tsx
import { createClient } from "@/lib/supabase/server";
import JoinForm from "./JoinForm";
import AccountPanel from "@/components/AccountPanel";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <JoinForm />;

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return <AccountPanel me={me} email={user.email ?? ""} userId={user.id} />;
}
```

- [ ] **Step 4: Update `src/components/AccountPanel.tsx`** to accept and use the real `userId`

Change the signature line:
```tsx
export default function AccountPanel({ me, email }: {
```
to:
```tsx
export default function AccountPanel({ me, email, userId }: {
  userId: string;
```
and change the body's `<AvatarEdit userId="" ...>` to `<AvatarEdit userId={userId} ...>`.

- [ ] **Step 5: Build check**

Run: `npm run build 2>&1 | grep "join/"`
Expected: no errors.

- [ ] **Step 6: Manual signed-in check**

Run `npm run dev`, sign in with a test account at `/join`, reload `/join`.
Expected: page now shows "Your account" (profile form + sign out), not the sign-in form.

- [ ] **Step 7: Commit**

```bash
git add src/app/join src/components/AccountPanel.tsx
git commit -m "Join becomes Account when signed in: profile edit + sign out, replacing dashboard/members profile forms"
```

---

## Task 9: Dashboard component — drop i18n (used on Home)

**Files:**
- Modify: `src/components/Dashboard.tsx` (full rewrite — remove `T`/`t` entirely)

- [ ] **Step 1: Rewrite `src/components/Dashboard.tsx`** — identical structure to the current file, every `t("dash.x")` replaced with its English literal, `t`/`T` parameter removed from every function signature (`Led`, `Card`, `Dead`, `Dashboard`).

```tsx
import {
  Weather, Air, Prayer, Rates, Quakes, AirCompare,
  wmoLabel, wmoIcon, moonPhase, fmtTime, dayName,
} from "@/lib/village";
import { timeAgo } from "@/components/ui";
import LiveCam from "@/components/LiveCam";
import ExchangeButton from "@/components/ExchangeButton";
import WeatherScene, { timePhase, celestialPos, type Phase } from "@/components/WeatherScene";
import AirInfo from "@/components/AirInfo";
import PrayerInfo from "@/components/PrayerInfo";

function Led({ live }: { live: boolean }) {
  return (
    <span className="flex items-center" title={live ? "Live" : "Unavailable right now"}>
      <span className={`led ${live ? "led-live" : "led-dead"}`} aria-hidden />
    </span>
  );
}

function Card({ title, icon, live, info, children, className = "" }: {
  title: string; icon?: string; live: boolean; info?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/20 bg-black/25 backdrop-blur-md text-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-sm">{icon}</span>}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/80">{title}</h3>
        {info}
        <span className="ml-auto"><Led live={live} /></span>
      </div>
      {children}
    </div>
  );
}

function Dead({ label = "Feed unavailable right now." }: { label?: string }) {
  return <p className="text-sm text-white/70 py-1">{label}</p>;
}

export function Dashboard({ weather, air, airCompare, prayer, rates, quakes }: {
  weather: Weather; air: Air; airCompare: AirCompare; prayer: Prayer; rates: Rates; quakes: Quakes;
}) {
  const moon = moonPhase();
  const generatedAt = new Date();
  const stamp = generatedAt.toLocaleTimeString("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" });
  const istHM = generatedAt.toLocaleTimeString("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false });
  const nowMin = Number(istHM.slice(0, 2)) * 60 + Number(istHM.slice(3, 5));
  const phase: Phase = weather ? timePhase(weather.today.sunrise, weather.today.sunset, nowMin) : "day";
  const celestial = weather ? celestialPos(weather.today.sunrise, weather.today.sunset, nowMin) : undefined;

  return (
    <section className="mt-4">
      <div className="flex items-baseline justify-between flex-wrap gap-1 mb-4">
        <h2 className="display text-2xl font-semibold text-olive-deep">The village, right now</h2>
        <p className="text-[11px] text-faded" title="This page regenerates from live APIs roughly every 30 minutes.">
          Data refreshed {stamp} · Europe/Istanbul · every ~30 min
        </p>
      </div>

      <div className="relative rounded-3xl overflow-hidden p-2 sm:p-3">
        <div className="absolute inset-0" aria-hidden>
          <WeatherScene code={weather ? weather.now.code : 0} phase={phase} celestial={celestial} />
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <Card title="Weather" icon={weather ? wmoIcon(weather.now.code, weather.now.isDay) : "⛅"} live={Boolean(weather)} className="col-span-2">
            {weather ? (
              <>
                <div className="flex items-end gap-3">
                  <span className="display text-4xl font-semibold leading-none drop-shadow">{Math.round(weather.now.temp)}°</span>
                  <div className="text-sm pb-0.5 drop-shadow-sm">
                    <p>{wmoLabel(weather.now.code)}</p>
                    <p className="text-white/85">{Math.round(weather.today.min)}–{Math.round(weather.today.max)}° · 💨 {Math.round(weather.now.wind)} km/h</p>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-white/25">
                  {weather.daily.slice(1, 6).map((d) => (
                    <div key={d.date} className="text-center drop-shadow-sm">
                      <p className="text-[11px] text-white/80">{dayName(d.date)}</p>
                      <p className="text-base leading-tight">{wmoIcon(d.code)}</p>
                      <p className="text-[11px]"><span>{Math.round(d.max)}°</span> <span className="text-white/70">{Math.round(d.min)}°</span></p>
                    </div>
                  ))}
                </div>
              </>
            ) : <Dead label="Weather feed unavailable right now." />}
          </Card>

          <Card title="Sun & moon" icon="🌅" live={Boolean(weather)}>
            {weather ? (
              <div className="space-y-1 text-sm">
                <p className="flex justify-between"><span className="text-white/70">Sunrise</span><span>{fmtTime(weather.today.sunrise)}</span></p>
                <p className="flex justify-between"><span className="text-white/70">Sunset</span><span>{fmtTime(weather.today.sunset)}</span></p>
                <p className="flex justify-between pt-1 border-t border-white/20"><span className="text-white/70">UV max</span><span>{Math.round(weather.today.uv)}</span></p>
                <p className="flex justify-between"><span className="text-white/70">Moon</span><span>{moon.icon} {moon.name.split(" ")[0]}</span></p>
              </div>
            ) : <Dead />}
          </Card>

          <Card title="Prayer times" icon="🕌" live={Boolean(prayer)} info={<PrayerInfo />}>
            {prayer ? (
              <>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm">
                  {prayer.timings.map((p) => (
                    <div key={p.name} className={p.name === prayer.next ? "text-amber-200 font-semibold" : ""}>
                      <p className="text-[10px] text-white/60 uppercase leading-tight">{p.name}</p>
                      <p className="leading-tight">{p.time}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/60 mt-2 pt-2 border-t border-white/20">{prayer.hijri} · Diyanet</p>
              </>
            ) : <Dead />}
          </Card>

          <Card title="Air quality" icon="💨" live={Boolean(air)} info={<AirInfo compare={airCompare} />}>
            {air ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="display text-3xl font-semibold leading-none drop-shadow">{air.aqi}</span>
                  <span className="text-xs pb-1 px-2 py-0.5 rounded-full font-medium" style={{ background: air.color }}>{air.label}</span>
                </div>
                <p className="text-xs text-white/70 mt-2">PM2.5 {air.pm25} µg/m³ · EU index</p>
              </>
            ) : <Dead />}
          </Card>

          <Card title="Exchange (→ ₺)" icon="💷" live={Boolean(rates)}>
            {rates ? (
              <div className="space-y-1 text-sm">
                <p className="flex justify-between"><span className="text-white/70">£1 GBP</span><span>₺{rates.GBP.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-white/70">€1 EUR</span><span>₺{rates.EUR.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-white/70">$1 USD</span><span>₺{rates.USD.toFixed(2)}</span></p>
              </div>
            ) : <Dead />}
            <ExchangeButton />
          </Card>

          <Card title="Quakes (250 km)" icon="🌍" live={Boolean(quakes)} className="col-span-2 md:col-span-1">
            {quakes ? (
              <>
                {quakes.list.length === 0 ? (
                  <p className="text-sm text-white/70">Nothing notable.</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {quakes.list.slice(0, 3).map((q, i) => (
                      <div key={i} className="flex justify-between gap-2">
                        <span className="flex items-baseline gap-1.5 min-w-0">
                          <span className={`font-semibold shrink-0 ${q.mag >= 4 ? "text-amber-200" : "text-white"}`}>M{q.mag.toFixed(1)}</span>
                          <span className="text-white/70 truncate text-[13px]">{q.place || "nearby"}</span>
                        </span>
                        <span className="text-white/60 text-[11px] shrink-0">{timeAgo(new Date(q.time).toISOString())}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-white/60 mt-2 pt-2 border-t border-white/20">USGS</p>
              </>
            ) : <Dead />}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <LiveCam />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: **succeeds with zero errors.** This is the first point in the plan where the whole app compiles clean — every file that referenced i18n has now been rewritten (`layout.tsx`, `Header.tsx`, `page.tsx`, `community/page.tsx`, `community/opportunities/page.tsx`, `guide/page.tsx`, `guide/gallery/[category]/page.tsx`, `join/page.tsx`, `CategoryCovers.tsx`, `Dashboard.tsx`). Confirm with:

```bash
grep -rn "useLang\|from \"@/lib/i18n\"\|lang-server\|LanguageProvider\|LanguagePicker\|WelcomeModal\|t(\"" src
```
Expected: no output.

- [ ] **Step 3: Delete the now-fully-orphaned i18n library files**

```bash
git rm src/lib/i18n.ts src/lib/lang-server.ts src/components/LanguageProvider.tsx src/components/LanguagePicker.tsx src/components/WelcomeModal.tsx
npm run build
```
Expected: still succeeds (nothing imports these anymore).

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: no errors (warnings about `<img>` vs `next/image` are pre-existing and suppressed inline with `eslint-disable-next-line` comments already present in the code — do not introduce new ones).

- [ ] **Step 5: Commit**

```bash
git add src/components/Dashboard.tsx
git commit -m "Drop i18n from Dashboard; delete the now-unused i18n library and language/welcome components"
```

---

## Task 10: Admin restyle (functional no-op)

**Files:**
- Modify: `src/app/admin/page.tsx` (class-level restyle only — no logic, query, or markup-structure changes)

**Interfaces:** unchanged — same server actions (`removeContent`, `clearFlag`, `editPost`, `editPhoto`, `markEmailRead`, `deleteEmail`), same data shape.

- [ ] **Step 1: Swap ad-hoc section styling for the shared `Card` pattern.** Since this file has zero i18n and zero IA changes, this is a surgical edit, not a rewrite. Make these specific replacements in `src/app/admin/page.tsx`:

  - Line 1-9: add `import { Card } from "@/components/ui";` to the import block.
  - Every `bg-white border border-sand rounded-xl` / `rounded-2xl` occurrence (review queue rows, recent posts, recent photos, inbox rows, map-pin rows — lines ~208, ~228, ~256, ~287, ~317) stays as-is where it's already consistent with the Task 2 `Card` pattern (`rounded-2xl border border-sand bg-white`, `rounded-xl border border-sand bg-white` is the same family at a smaller radius for list rows — leave list-row radius at `rounded-xl` intentionally, it's a deliberate size distinction between container cards and list rows, not an inconsistency).
  - `function Shell({ children })` (line 331-333): no change needed — already `max-w-4xl px-4 py-10 space-y-8`, consistent spacing scale.
  - `function Section({ title, children })` (line 334-341): no change needed — already the shared section-header pattern (`text-xs font-semibold uppercase tracking-wider text-faded mb-2`), matches `PageHeader`'s subtitle styling family.

  **Net effect of this task: import `Card` for potential future use, verify (don't blindly change) that every existing style in this file already matches the Task 2 design tokens** — it does, because `/admin` was already built with the same Tailwind tokens as the rest of the app. No visual regression risk, no functional change.

- [ ] **Step 2: Build check**

Run: `npm run build 2>&1 | grep "admin/page.tsx"`
Expected: no output.

- [ ] **Step 3: Manual check**

Run `npm run dev`, sign in as an admin (`profiles.is_admin = true`), visit `/admin`.
Expected: page renders identically to before — agent panel, feed health, content counts, review queue, recent posts/photos edit, support inbox, map pins all present and functional.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "Confirm /admin already matches the shared design system; import Card for consistency"
```

---

## Task 11: Grok-generated visuals

> **SKIPPED (2026-07-13):** all 7 `grok-mcp` image-generation calls failed with
> `PERMISSION_DENIED` — the xAI account is over its spend cap/out of credits.
> Evan chose to ship without AI visuals rather than switch engines or wait on
> billing. Home keeps the existing `HeroSlideshow` (member-uploaded photos +
> gradient fallback, unchanged from before this plan); Guide ships without a
> header illustration. `public/village/` was never created in the shipped
> tree. Revisit this task standalone once the xAI billing issue is resolved.

**Files:**
- Create: `public/village/hero-1.jpg` … `public/village/hero-6.jpg` (6 files)
- Create: `public/village/guide-3d.jpg` (1 file)
- Modify: `src/app/page.tsx` (wire hero default set)
- Modify: `src/app/guide/page.tsx` (add header art)

- [ ] **Step 1: Generate the hero photo set** — call `mcp__grok-mcp__generate_image` six times, saving each result to `public/village/hero-{1..6}.jpg`. Prompts (one per image, photoreal style):
  1. "Photorealistic view of a 900-year-old Anatolian stone village at golden hour, olive trees in foreground, Turkish flag on a distant rooftop, warm terracotta and olive-green tones, no people, wide landscape shot"
  2. "Photorealistic turquoise lake shoreline with white mineral formations, Lake Salda Turkey style, clear water, pine-covered hills in background, midday light"
  3. "Photorealistic Turkish olive grove on a gentle hillside, rows of old gnarled olive trees, warm afternoon light, dry grass, distant mountains"
  4. "Photorealistic small Turkish village square at dusk, stone houses with wooden shutters, a single street lamp lit, warm golden-hour sky, empty cobblestone street"
  5. "Photorealistic aerial view of a small Anatolian village nestled among green hills, terracotta rooftops, one minaret, farmland patchwork surrounding it, soft morning haze"
  6. "Photorealistic close-up of a traditional stone village house facade, wooden door, potted geraniums on the windowsill, climbing vine, warm stone texture, midday sun"

- [ ] **Step 2: Generate the Guide header illustration** — one call to `mcp__grok-mcp__generate_image`, saved to `public/village/guide-3d.jpg`. Prompt: "Stylized isometric 3D render of a small Turkish village nestled between green hills and a turquoise lake, warm terracotta rooftops, olive groves, miniature diorama style, soft studio lighting, clean vector-render aesthetic, no text"

- [ ] **Step 3: Wire the hero set into `src/app/page.tsx`** — change the `heroImages` line (in the `Home` function) from:
```tsx
const heroImages = (featRes.data ?? []).map((r) => r.url as string);
```
to:
```tsx
const DEFAULT_HERO_IMAGES = [
  "/village/hero-1.jpg", "/village/hero-2.jpg", "/village/hero-3.jpg",
  "/village/hero-4.jpg", "/village/hero-5.jpg", "/village/hero-6.jpg",
];
const uploadedHero = (featRes.data ?? []).map((r) => r.url as string);
const heroImages = uploadedHero.length > 0 ? [...DEFAULT_HERO_IMAGES, ...uploadedHero] : DEFAULT_HERO_IMAGES;
```

- [ ] **Step 4: Add the illustration to `src/app/guide/page.tsx`** — insert directly under the opening `<div className="mx-auto max-w-5xl px-4 py-10">` and before the `<div className="max-w-2xl">` block:
```tsx
<div className="rounded-3xl overflow-hidden border border-sand mb-8">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src="/village/guide-3d.jpg" alt="Illustrated overview of Güney village" className="w-full h-48 sm:h-64 object-cover" />
</div>
```

- [ ] **Step 5: Build + visual check**

Run: `npm run build` — expected clean.
Run `npm run dev`, load `/` and confirm the hero slideshow shows the 6 new images; load `/guide` and confirm the illustration renders above the title.

- [ ] **Step 6: Commit**

```bash
git add public/village src/app/page.tsx src/app/guide/page.tsx
git commit -m "Add Grok-generated hero photo set and Guide 3D village illustration"
```

---

## Task 12: Full end-to-end test gate (spec §8) — the go/no-go checkpoint

**Files:**
- Create: `scripts/e2e-smoke.spec.ts` (temporary Playwright script — not part of the shipped app, used once for this gate; may be deleted after or kept for future regressions, Evan's call)

**Interfaces:** none — this is a verification task, not a feature task.

- [ ] **Step 1: `npm run build` and `npm run lint` one final time on the complete tree**

Run: `npm run build && npm run lint`
Expected: both clean.

- [ ] **Step 2: Write `scripts/e2e-smoke.spec.ts`** using `@playwright/test` (install as a dev dependency if not present: `npm install -D @playwright/test && npx playwright install chromium`)

```ts
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("Public navigation", () => {
  test("nav links resolve, no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of ["/", "/guide", "/community", "/join"]) {
      await page.goto(`${BASE}${path}`);
      await expect(page).toHaveURL(new RegExp(path === "/" ? "/$" : path));
    }
    expect(errors).toEqual([]);
  });

  test("old routes redirect, never 404", async ({ page }) => {
    const cases: [string, RegExp][] = [
      ["/gallery", /\/guide/],
      ["/gallery/salda", /\/guide\/gallery\/salda/],
      ["/dashboard", /\/community$/],
      ["/members", /\/community$/],
      ["/opportunities", /\/community\/opportunities$/],
    ];
    for (const [from, to] of cases) {
      const res = await page.goto(`${BASE}${from}`);
      expect(res?.status()).toBeLessThan(400);
      await expect(page).toHaveURL(to);
    }
  });

  test("community tabs switch correctly", async ({ page }) => {
    await page.goto(`${BASE}/community`);
    await page.getByRole("link", { name: "Chat" }).click();
    await expect(page).toHaveURL(/\/community\/chat/);
    await page.getByRole("link", { name: "Marketplace" }).click();
    await expect(page).toHaveURL(/\/community\/marketplace/);
    await page.getByRole("link", { name: "Opportunities" }).click();
    await expect(page).toHaveURL(/\/community\/opportunities/);
    await page.getByRole("link", { name: "Feed" }).click();
    await expect(page).toHaveURL(/\/community$/);
  });

  test("mobile viewport renders nav on all 4 pages", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/", "/guide", "/community", "/join"]) {
      await page.goto(`${BASE}${path}`);
      await expect(page.locator("header")).toBeVisible();
    }
  });
});

test.describe("Signed-out forms visibly gate on Join", () => {
  test("community feed shows join prompt, not a post form", async ({ page }) => {
    await page.goto(`${BASE}/community`);
    await expect(page.getByRole("link", { name: /Join the community/i })).toBeVisible();
  });
  test("opportunities shows join prompt", async ({ page }) => {
    await page.goto(`${BASE}/community/opportunities`);
    await expect(page.getByRole("link", { name: "Join" })).toBeVisible();
  });
  test("marketplace shows join prompt", async ({ page }) => {
    await page.goto(`${BASE}/community/marketplace`);
    await expect(page.getByRole("link", { name: "Join" })).toBeVisible();
  });
});

test.describe("Sign-up form validation (no real account created)", () => {
  test("sign-up requires terms checkbox", async ({ page }) => {
    await page.goto(`${BASE}/join`);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.getByLabel("Your name").fill("Test Smoke");
    await page.getByLabel("Email").fill(`smoke-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("testpass123");
    await page.getByRole("button", { name: "Create account" }).last().click();
    await expect(page.getByText(/accept the terms/i)).toBeVisible();
  });

  test("OAuth buttons are present and clickable (completion out of scope)", async ({ page }) => {
    await page.goto(`${BASE}/join`);
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Facebook" })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the smoke suite against a local dev server**

```bash
npm run dev &
sleep 3
npx playwright test scripts/e2e-smoke.spec.ts
```
Expected: all tests pass. If any fail, fix the underlying page/component (not the test) and re-run before proceeding — this is the hard gate from the spec.

- [ ] **Step 3: Manual pass for the parts a scripted smoke test can't safely cover** (these mutate real Supabase rows, so do them by hand against a disposable test account rather than in the automated suite):
  - Create a post in each of the 4 Community post types (update/event/notice/help) — confirm it appears in the feed and on Home's "Latest".
  - Post a message in Town Square chat — confirm it appears live.
  - Post a marketplace listing — confirm it appears in the grid.
  - Post an opportunity — confirm it appears in `/community/opportunities` and (if within the top 2 open) on Home.
  - Edit your profile (name/bio/skills/phone) via `/join` while signed in — confirm the change reflects in Your Corner and the "Who's here" directory.
  - Upload an avatar — confirm it appears in the header and Your Corner.
  - Upload a photo via `/guide/gallery/salda` — confirm it appears in that category grid and in the category cover on `/guide`.
  - Sign out, sign back in with the same test account — confirm session persists as expected.
  - As an admin, visit `/admin` — confirm the newly-created test post/listing/photo appear in "Recent posts/photos", and that Approve/Remove buttons work on a flagged item (post something that trips `screenText` moderation, e.g. a body containing a raw phone number or URL, to generate one).

- [ ] **Step 4: Content-source and duplication audit** (manual, checklist-style — confirm each, don't just skim)
  - [ ] Every figure on Home's live dashboard (temp, wind, sunrise/sunset, prayer times, AQI, exchange rates, quakes) changes on reload after the 30-min revalidate window — not hardcoded.
  - [ ] Gallery photos appear ONLY under `/guide` (and its `/guide/gallery/[category]` sub-routes) — not duplicated on Home.
  - [ ] Profile editing exists ONLY at `/join` (signed in) — confirm it's gone from anywhere else.
  - [ ] Member directory exists ONLY inside Your Corner's "Who's here" — confirm there's no other member list anywhere.
  - [ ] Opportunities exist ONLY under `/community/opportunities` — confirm the old `/opportunities` truly redirects rather than rendering a second copy.

- [ ] **Step 5: Decide on the smoke script's fate and commit**

Ask Evan whether to keep `scripts/e2e-smoke.spec.ts` in the repo as a standing regression check or delete it now that the gate has passed. Default (if no preference given): keep it, add `@playwright/test` to `package.json` devDependencies properly (already done by `npm install -D` in Step 1), add a `"test:e2e": "playwright test scripts/e2e-smoke.spec.ts"` script to `package.json`.

```bash
git add scripts/e2e-smoke.spec.ts package.json package-lock.json
git commit -m "Add end-to-end smoke test gate; all 4 nav pages, redirects, tabs, and forms verified clean"
```

- [ ] **Step 6: Push to `main`**

```bash
git push origin main
```

This triggers the Vercel production deploy. Confirm the deploy succeeds (check the Vercel dashboard or `vercel ls` if the CLI is authenticated) and spot-check `https://guney.live/` once live.

---

## Self-Review

**1. Spec coverage:**
- IA consolidation to 4 pages + hidden admin (§4): Tasks 1, 4, 5, 6, 7, 8, 8b. ✓
- Old-route redirects (§4 redirects, §8.2): Tasks 4, 6, 7, verified in Task 12 Step 2. ✓
- Visual system evolution, no corkboard/notes (§5): Tasks 2, 3. ✓
- AI visuals (§6): Task 11. ✓
- i18n removal (§7): Tasks 1, 3, 4, 5, 6, 7, 8, 9 (removal completed and verified in Task 9). ✓
- Testing gate (§8): Task 12. ✓
- Deploy (§9): Task 12 Step 6. ✓
- No content duplication (added constraint from Evan's follow-up): explicitly covered by Task 3 (Home drops gallery/photo-pins), Task 6 (single member directory location), Task 8b (single profile-edit location), and re-verified in Task 12 Step 4. ✓
- Homepage clear single message (added constraint): Task 3 hero copy. ✓

**2. Placeholder scan:** none found.

**3. Type consistency:** `Card`/`PageHeader` (Task 2) signatures used identically in Tasks 3, 4, 5, 7. `CommunityTabs()` (Task 4) takes no props, matches its one call site (Task 4/6 layout). `YourCorner({ userId })` (Task 6) matches its call site in `community/layout.tsx`. `AccountPanel({ me, email, userId })` (Task 8b Step 4, final signature) matches its call site in `join/page.tsx` (Task 8b Step 3, final version). `Dashboard({ weather, air, airCompare, prayer, rates, quakes })` (Task 9, no `t`) matches its call site in `page.tsx` (Task 3, called without `t` — Task 3's known-failing build line is exactly resolved by Task 9). `CategoryCovers({ stats })` (Task 7, no `t`) matches its call sites in `page.tsx`... **correction:** Task 3's rewritten Home no longer calls `CategoryCovers` at all (gallery duplication removed per spec) — only `guide/page.tsx` (Task 7) calls it. Confirmed no stale call site remains.
