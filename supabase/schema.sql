create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.favorite_restaurants (
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, restaurant_slug)
);

create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  cuisine text not null,
  zone text,
  budget integer not null,
  distance_km integer not null,
  vibes text[] not null default '{}',
  user_lat double precision,
  user_lng double precision,
  selected_results text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_slug text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint restaurant_interactions_action_check
    check (action in ('view_detail', 'open_from_results', 'favorite_added', 'favorite_removed', 'shared'))
);

alter table public.profiles enable row level security;
alter table public.favorite_restaurants enable row level security;
alter table public.search_events enable row level security;
alter table public.restaurant_interactions enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "favorite_restaurants_own_all"
on public.favorite_restaurants
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "search_events_own_insert"
on public.search_events
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "search_events_own_select"
on public.search_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "restaurant_interactions_own_insert"
on public.restaurant_interactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "restaurant_interactions_own_select"
on public.restaurant_interactions
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
