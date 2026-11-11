begin;

-- Initial application schema; managed schemas and global default ACLs stay unchanged.
-- Требуется существующий Supabase auth schema; не vanilla Postgres migration.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or
    (char_length(btrim(display_name)) between 1 and 80)),
  hometown text check (hometown is null or
    (char_length(btrim(hometown)) between 1 and 100)),
  bio text check (bio is null or char_length(bio) <= 280),
  created_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (
    char_length(slug) <= 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  region text not null check (char_length(btrim(region)) between 1 and 160),
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  why text not null check (char_length(btrim(why)) between 1 and 2000),
  category text not null check (
    char_length(category) <= 64 and category ~ '^[a-z][a-z0-9]*(_[a-z0-9]+)*$'),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  tags text[] not null default '{}' check (
    tags <@ array['mountains', 'lakes', 'scenic', 'weekend']::text[]
    and array_position(tags, null) is null),
  image_url text check (image_url is null or
    (image_url like 'https://%' and char_length(image_url) <= 2048)),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table public.place_sources (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  kind text not null check (kind in ('coordinates', 'content', 'image')),
  field_key text not null check (
    char_length(field_key) <= 64 and field_key ~ '^[a-z][a-z0-9]*(_[a-z0-9]+)*$'),
  provider text not null check (char_length(btrim(provider)) between 1 and 100),
  source_url text not null check (
    source_url like 'https://%' and octet_length(source_url) <= 2048),
  retrieved_at date not null,
  is_primary boolean not null default false,
  method text,
  feature text,
  attribution text not null check (char_length(btrim(attribution)) between 1 and 1000),
  license text not null check (char_length(btrim(license)) between 1 and 200),
  unique (place_id, kind, field_key, source_url, retrieved_at),
  check (kind <> 'coordinates' or (
    field_key = 'coordinates'
    and method is not null and char_length(btrim(method)) between 1 and 100
    and feature is not null and char_length(btrim(feature)) between 1 and 1000
  ))
);

-- Максимум один выбранный источник для конкретного kind/field, остальные сохраняются.
create unique index place_sources_primary_idx
  on public.place_sources (place_id, kind, field_key) where is_primary;

create table public.saved_places (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- PK (user_id, place_id) уже индексирует ownership predicate.
create index saved_places_user_order_idx
  on public.saved_places (user_id, created_at desc, place_id);
-- Обратный FK lookup при удалении place не покрывается первым столбцом PK.
create index saved_places_place_idx on public.saved_places (place_id);

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.place_sources enable row level security;
alter table public.saved_places enable row level security;

revoke all on table public.profiles, public.places,
  public.place_sources, public.saved_places from PUBLIC, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.places, public.place_sources to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, display_name, hometown, bio) on public.profiles to authenticated;
grant update (display_name, hometown, bio) on public.profiles to authenticated;
grant select, delete on public.saved_places to authenticated;
grant insert (user_id, place_id) on public.saved_places to authenticated;

create policy places_read_published on public.places
  for select to anon, authenticated using (status = 'published');

create policy place_sources_read_published on public.place_sources
  for select to anon, authenticated using (exists (
    select 1 from public.places p
    where p.id = place_sources.place_id and p.status = 'published'
  ));

create policy profiles_read_own on public.profiles
  for select to authenticated using (
    id = (select auth.uid())
    and ((select auth.jwt())->>'is_anonymous')::boolean is false
  );
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (
    id = (select auth.uid())
    and ((select auth.jwt())->>'is_anonymous')::boolean is false
  );
create policy profiles_update_own on public.profiles
  for update to authenticated using (
    id = (select auth.uid())
    and ((select auth.jwt())->>'is_anonymous')::boolean is false
  ) with check (
    id = (select auth.uid())
    and ((select auth.jwt())->>'is_anonymous')::boolean is false
  );

create policy saved_places_read_own on public.saved_places
  for select to authenticated using (
    user_id = (select auth.uid())
    and ((select auth.jwt())->>'is_anonymous')::boolean is false
  );
create policy saved_places_insert_own_published on public.saved_places
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and ((select auth.jwt())->>'is_anonymous')::boolean is false
    and exists (
      select 1 from public.places p
      where p.id = saved_places.place_id and p.status = 'published'
    )
  );
create policy saved_places_delete_own on public.saved_places
  for delete to authenticated using (
    user_id = (select auth.uid())
    and ((select auth.jwt())->>'is_anonymous')::boolean is false
  );

-- Only the trusted migration operator owns application relations.
alter table public.profiles owner to postgres;
alter table public.places owner to postgres;
alter table public.place_sources owner to postgres;
alter table public.saved_places owner to postgres;

commit;
