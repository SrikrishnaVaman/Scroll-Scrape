-- Scroll Scrape: tables, row-level security and photo storage.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Every table carries user_id, and row-level security (RLS) means a signed-in
-- user can only ever see or change rows where user_id is their own id.

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-zA-Z0-9_.]{3,30}$'),
  created_at timestamptz not null default now()
);

-- When someone signs up, copy the username they typed into profiles.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up page check a username is free without seeing anyone's rows.
create function public.username_available(name text)
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(name));
$$;

grant execute on function public.username_available(text) to anon, authenticated;

-- ------------------------------------------------------------------ spaces
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  city text not null,
  country text not null,
  center_lat double precision,
  center_lng double precision,
  created_at timestamptz not null default now(),
  unique (user_id, city, country),
  unique (id, user_id)
);

-- ------------------------------------------------------------------ places
create table public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  space_id uuid not null,
  google_place_id text,
  name text not null,
  place_type text,
  address text,
  lat double precision,
  lng double precision,
  opening_hours jsonb,
  rating numeric,
  rating_count integer,
  price_level text,
  price_range jsonb,
  cost_per_person text,
  busy_times text,
  post_url text,
  caption text,
  source text check (source in ('link', 'screenshot')),
  visited boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  -- a place can only sit in a space owned by the same user
  foreign key (space_id, user_id) references public.spaces (id, user_id) on delete cascade
);

create index places_space_id_idx on public.places (space_id);

-- ------------------------------------------------------------------ photos
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  place_id uuid,
  storage_path text not null,
  taken_at timestamptz,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  foreign key (place_id, user_id) references public.places (id, user_id) on delete cascade
);

create index photos_place_id_idx on public.photos (place_id);

-- ------------------------------------------------------------------- plans
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  space_id uuid,
  request text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  foreign key (space_id, user_id) references public.spaces (id, user_id) on delete cascade
);

-- ------------------------------------------------------ row-level security
alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.places enable row level security;
alter table public.photos enable row level security;
alter table public.plans enable row level security;

create policy "Own profile: read" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Own profile: update" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Own spaces" on public.spaces
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own places" on public.places
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own photos" on public.photos
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own plans" on public.plans
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.spaces, public.places, public.photos, public.plans to authenticated;

-- ------------------------------------------------------------ photo storage
-- A private bucket. Files live at {user_id}/{photo_id}.jpg and each user can
-- only read and write inside their own folder.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "Own photo files: read" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Own photo files: upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Own photo files: delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
