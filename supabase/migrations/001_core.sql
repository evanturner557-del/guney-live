-- Guney.live core schema
create extension if not exists "pgcrypto";

-- Member profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  bio text,
  connection text not null default 'newcomer'
    check (connection in ('villager','diaspora','newcomer','visitor')),
  skills text,
  created_at timestamptz not null default now()
);

-- One feed, typed posts (updates, events, notices, help requests)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text, -- fallback for seeded/system content
  type text not null default 'update'
    check (type in ('update','event','notice','help')),
  title text not null,
  body text not null,
  event_date timestamptz,
  event_location text,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);

-- Opportunities: things to build, join, improve
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('land','property','restoration','business','farm','skills','volunteer','collaboration')),
  title text not null,
  summary text not null,
  details text,
  contact text,
  status text not null default 'open' check (status in ('open','in_progress','closed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Guide: practical knowledge base (explore + visit merged)
create table public.guide_articles (
  id uuid primary key default gen_random_uuid(),
  category text not null
    check (category in ('getting-here','staying','living','nature','services','faq')),
  slug text not null unique,
  title text not null,
  body text not null, -- markdown
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.opportunities enable row level security;
alter table public.guide_articles enable row level security;

-- Public can read content; only members (authenticated) see the directory
create policy "profiles readable by members" on public.profiles
  for select to authenticated using (true);
create policy "own profile insert" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "posts public read" on public.posts for select using (true);
create policy "members create posts" on public.posts
  for insert to authenticated with check (auth.uid() = author_id);
create policy "authors update own posts" on public.posts
  for update to authenticated using (auth.uid() = author_id);
create policy "authors delete own posts" on public.posts
  for delete to authenticated using (auth.uid() = author_id);

create policy "comments public read" on public.comments for select using (true);
create policy "members create comments" on public.comments
  for insert to authenticated with check (auth.uid() = author_id);
create policy "authors delete own comments" on public.comments
  for delete to authenticated using (auth.uid() = author_id);

create policy "opportunities public read" on public.opportunities for select using (true);
create policy "members create opportunities" on public.opportunities
  for insert to authenticated with check (auth.uid() = created_by);
create policy "creators update own opportunities" on public.opportunities
  for update to authenticated using (auth.uid() = created_by);

create policy "guide public read" on public.guide_articles for select using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, connection)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'connection', 'newcomer')
  ) on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpful indexes
create index posts_created_idx on public.posts (created_at desc);
create index posts_type_idx on public.posts (type);
create index posts_event_date_idx on public.posts (event_date) where event_date is not null;
create index opportunities_status_idx on public.opportunities (status, created_at desc);
create index comments_post_idx on public.comments (post_id, created_at);
create index guide_cat_idx on public.guide_articles (category, sort);
