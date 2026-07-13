# Güney.live redesign — design spec

Date: 2026-07-13
Status: approved by Evan, ready for implementation plan

## 1. Context

Güney.live is a Next.js 16 + Supabase community platform for the village of Güney
(Yeşilova, Burdur, Turkey), source at `~/Desktop/guney-live`, GitHub
`evanturner557-del/guney-live` on `main`, auto-deployed to production
(guney.live) via Vercel on every push to `main`.

The app has grown organically into a large surface: a live home dashboard
(weather/air/prayer/exchange/quakes), a community feed, a live town-square
chat, a marketplace, an opportunities board, a photo gallery, a village guide,
a member directory, a separate gamified member dashboard, a full admin/
moderation "agent" back office, 34-language i18n (only EN/TR actually
translated), a newcomer welcome modal, and standard/OAuth/magic-link auth.

Per Evan: **there is no real user data to protect** — treat this as a design
exercise on a real, working codebase, not a live-data migration. This spec
covers a full consolidation and visual redesign down to a minimal, warm,
professional 4-page public app (plus a hidden admin page), with two AI-
generated visual assets (Grok), full English-only copy, and a mandatory
end-to-end test pass before deploy.

## 2. Goals

- Public nav collapses from ~12 routes to **4**: Home, Guide, Community, Join
  (Admin stays a 5th, unlisted, back-office page).
- Every section reads as **one coherent design system** — same card/spacing/
  shadow/type patterns everywhere, no page-specific gimmicks.
- **No duplicated content** between pages (e.g. photos live only in Guide, not
  repeated on Home).
- Homepage carries **one clear message** and **one clear primary action**.
- Warm identity (cream/olive/terra palette, Fraunces display type) preserved
  and evolved, not replaced — but the "corkboard + pinned tilted note" gimmick
  is removed in favor of a calm, professional grid.
- Two AI-generated visual assets from **grok-mcp** (hero photography set +
  one stylized 3D village illustration).
- English only — the 34-language i18n system is removed entirely.
- Full click-through test pass (every nav link, button, form, tab, viewport,
  signed-in/out state) before anything is pushed to `main`.

## 3. Non-goals

- No Supabase schema changes beyond what's needed to drop unused
  language-preference columns/tables if any exist (verify in plan phase).
- No new backend features (no DMs, no real payment flow for marketplace,
  etc.) — this is IA consolidation + visual redesign of existing features.
- No fix for OAuth (Google/Facebook) actually completing sign-in — those
  buttons will visibly attempt OAuth but likely fail without live provider
  credentials in this environment. This is a known, called-out limitation,
  not a bug to chase.
- GPT-image-2 is not connected as a tool in this environment; grok-mcp is the
  substitute for all generated imagery (Evan confirmed this is fine).

## 4. Information architecture

| Page | Route | Replaces / absorbs |
|---|---|---|
| **Home** | `/` | itself — tightened copy, no duplicated gallery content |
| **Guide** | `/guide` | old `/guide` + `/gallery` + `/gallery/[category]` |
| **Community** | `/community` (+ `/community/chat`, `/community/marketplace`, `/community/opportunities`, `/community/[id]`) | old `/community`, `/community/chat`, `/community/marketplace`, `/opportunities` (moved under `/community`), `/dashboard`, `/members` |
| **Join** | `/join` | itself, signed-in state repurposed as "Account" |
| Admin *(hidden)* | `/admin` | itself, restyled only |

Legal pages `/privacy`, `/terms` remain, linked only from the footer (not nav
items, not counted toward the page budget). Auth utility routes
(`/auth/callback`, `/auth/confirm`, `/auth/forgot`, `/auth/reset`) are
unchanged plumbing, not pages a user navigates to directly.

**Redirects:** old routes that no longer exist as standalone pages
(`/gallery`, `/gallery/[category]`, `/dashboard`, `/members`, `/opportunities`)
get a `redirect()` (Next.js) to their new home, so no old link/bookmark
404s.

### 4.1 Home (`/`)
- Hero: one clear sentence of value prop + one primary CTA ("Join") + one
  secondary CTA ("See the guide"). Hero art uses the new Grok-generated
  photo set (existing `HeroSlideshow` mechanism; Supabase-uploaded featured
  photos still layer in on top, unchanged).
- Live village dashboard (weather/air/prayer/exchange/quakes) — unchanged,
  it's a genuine highlight of the product.
- Map (unchanged, functional POI data).
- "Latest from the village" — a single trimmed strip of the 3 most recent
  posts/events/opportunities linking into Community, replacing the current
  3-column corkboard + scattered photo pins. No gallery photos on this page
  (those live only in Guide — removes the current Home/Guide content
  overlap).
- Orientation cards (New here? / Want to build? / Want in?) stay, restyled
  to the new card system.

### 4.2 Guide (`/guide`)
- Merges practical guide content (`guide_articles` categories: getting-here,
  staying, living, nature, services, faq) with the photo gallery
  (`CategoryCovers` grid + per-category photo pages) under one left side-nav
  (reusing existing `SideNav`/`NavCard` primitives).
- New: the stylized 3D village illustration as the page header art.
- Map reference/coordinates text stays here (already present).

### 4.3 Community (`/community/*`)
- Persistent tab bar: **Feed** (`/community`) · **Chat** (`/community/chat`)
  · **Marketplace** (`/community/marketplace`) · **Opportunities**
  (`/community/opportunities`, moved from top-level `/opportunities`).
  Implemented as one shared nav component (merging `CommunityNav` +
  `OpportunitiesNav` into a single tab bar), each tab a real nested route
  with its own server-side data fetch — unchanged data logic, new shared
  chrome.
- Signed-in-only **"Your Corner"** panel pinned above the tabs: avatar,
  contribution tier/points progress, getting-started checklist, inbox
  (replies) — this is the entire content of the old `/dashboard`, now
  embedded rather than a separate page.
- **"Who's here"** compact widget inside Your Corner: member count + a
  handful of avatars, expandable to the full list inline (replaces the
  standalone `/members` directory page). Profile editing itself moves to
  Join/Account (4.4) — no duplicate profile-edit form here.
- Post detail (`/community/[id]`) unchanged.

### 4.4 Join / Account (`/join`)
- Signed out: unchanged sign-in/sign-up tabs (email+password, magic link,
  Google/Facebook OAuth, consent checkboxes).
- **Signed in: same route renders "Account"** — profile edit (name,
  connection, bio, skills, phone, avatar via `AvatarEdit`) + sign out. This
  is the single home for profile editing (removed from `/dashboard` and
  `/members` — no duplication).

### 4.5 Admin (`/admin`, hidden)
- Functionally unchanged (agent panel, live feed health, content counts,
  review queue, recent posts/photos edit, support inbox, map pins needing
  coordinates).
- Restyled with the same card/spacing/shadow system as the public pages, so
  it reads as the same product rather than a bolted-on back office.

## 5. Visual system

- Keep existing design tokens as-is: `--color-cream/sand/ink/faded/olive/
  olive-deep/terra/terra-deep/sage`, `--font-display: Fraunces`,
  `--font-body: Inter`.
- Remove `.corkboard`, `.note`, `.note-tilt-*` and all `rotate(...)` pin
  styling — replace every use with the same plain card:
  `rounded-2xl border border-sand bg-white p-5` (shadow only on hover where
  it already exists, e.g. `PostCard`).
  - Keep `.led`/`led-pulse` (live/dead status dot) and the animated
    `WeatherScene` — both are functional, distinctive, and already calm.
  - Keep `.robot-*` animation classes (admin-only ops robot).
- One header pattern reused on Guide/Community/Join/Admin: `<h1
  className="display text-3xl sm:text-4xl font-semibold text-olive-deep">` +
  one `text-faded` line of subcopy underneath. Home's hero is the one
  intentional exception (larger, centered).
- Nav (`Header.tsx`): replace the hamburger-hides-everything menu with the 4
  links shown directly (Home / Guide / Community / Join or Account), current
  page indicated. Avatar + account dropdown (dashboard/members/admin/sign
  out) collapses to just avatar → Account + Admin (if applicable) + Sign out,
  since Members/Dashboard no longer exist as separate destinations.

## 6. AI-generated visuals (grok-mcp)

1. **Hero photo set** — 5–6 photoreal images: 900-year-old stone village
   houses, olive groves, Lake Salda turquoise shoreline (8 km out), village
   square in evening light. Generated via `mcp__grok-mcp__generate_image`,
   saved as static files under `public/village/hero-*.jpg`, wired in as the
   default set for `HeroSlideshow` (Supabase-uploaded featured photos still
   layer on top unchanged).
2. **3D village illustration** — one stylized isometric/aerial render of the
   village, used as decorative header art on the Guide page only. Does not
   replace the functional `VillageMap` (real POI coordinates).

Both are checked into the repo as static assets (no new Supabase storage
dependency, no extra runtime cost).

## 7. i18n removal

Delete `src/components/LanguagePicker.tsx`, `src/components/
LanguageProvider.tsx`, `src/lib/i18n.ts`, `src/lib/lang-server.ts`,
`src/components/WelcomeModal.tsx`. Every call site currently using
`useLang()`/`t("...")` (at least `CommunityNav`, `OpportunitiesNav`,
`Gallery`/gallery pages, `CategoryCovers`, `Header`, `page.tsx`,
`join/page.tsx`, `Dashboard.tsx`, `guide/page.tsx`, `opportunities/page.tsx`,
`community/page.tsx`) reverts to plain English string literals. The
implementation plan phase should grep for `useLang|t\(` to get the complete,
current call-site list before starting (some may have shifted since this
spec was written).

## 8. Testing / QA gate (must pass before `git push`)

1. `npm run build` and `npm run lint` — clean, no errors.
2. Playwright click-through against `npm run dev` covering:
   - All 4 nav links + Admin (as an admin user) + footer legal links.
   - Every button and form submit: create post, create opportunity, post in
     chat, create marketplace listing, edit profile, sign up, sign in, sign
     out, forgot/reset password, avatar upload.
   - All 4 Community tabs, both signed-in and signed-out chrome.
   - Old routes (`/gallery`, `/dashboard`, `/members`, `/opportunities`)
     redirect correctly, no 404s.
   - Mobile (375px) and desktop (1280px) viewports on all 4 pages.
3. Manual content-source audit: every live data point on Home (weather, air,
   prayer, exchange, quakes, posts, opportunities) traces to its existing
   Supabase table or API call — nothing hardcoded left behind by the merge.
4. Visual duplication check: confirm no content (photos, articles, listings)
   renders on more than one page.
5. OAuth buttons are exercised to confirm they *attempt* sign-in and fail
   gracefully (no crash) — actual provider completion is out of scope (see
   §3).

## 9. Deploy

Work happens directly on `main` (Evan confirmed no live-data risk). Commit
incrementally. `git push` only after the full §8 gate passes clean — this is
the single go/no-go checkpoint before guney.live updates in production.

## 10. Open items for the implementation plan phase

- Exact current list of `useLang`/`t()` call sites (grep fresh, don't trust
  this document's list above as exhaustive).
- Whether any Supabase tables/columns exist purely for the language feature
  (e.g. a `lang` preference on `profiles`) — drop if unused elsewhere.
- Exact wording for the new homepage hero copy and the merged Community tab
  bar — draft during implementation, not locked here.
