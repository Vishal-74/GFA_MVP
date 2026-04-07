-- Campus Messenger (MVP): channels + messages for admitted users.
-- Uses Supabase Realtime on Postgres changes.

create table if not exists campus_channels (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  kind text not null default 'public' check (kind in ('public', 'dm')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists campus_channel_members (
  channel_id uuid not null references campus_channels (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator')),
  joined_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create table if not exists campus_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references campus_channels (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- If tables already existed from a prior attempt, ensure required columns exist before indexes/policies.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'campus_channel_members') then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'campus_channel_members' and column_name = 'channel_id'
    ) then
      alter table public.campus_channel_members add column channel_id uuid;
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'campus_channel_members' and column_name = 'user_id'
    ) then
      alter table public.campus_channel_members add column user_id uuid;
    end if;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'campus_messages') then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'campus_messages' and column_name = 'channel_id'
    ) then
      -- Add as nullable to avoid failing on existing rows; RLS policies still require membership for non-null channel_id.
      alter table public.campus_messages add column channel_id uuid;
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'campus_messages' and column_name = 'user_id'
    ) then
      alter table public.campus_messages add column user_id uuid;
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'campus_messages' and column_name = 'body'
    ) then
      alter table public.campus_messages add column body text;
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'campus_messages' and column_name = 'created_at'
    ) then
      alter table public.campus_messages add column created_at timestamptz default now();
    end if;
  end if;
end $$;

do $$
begin
  create index if not exists idx_campus_messages_channel on public.campus_messages (channel_id, created_at);
exception when others then
  -- If an older schema has incompatible types, skip index creation (MVP fallback).
  null;
end $$;

do $$
begin
  create index if not exists idx_campus_members_user on public.campus_channel_members (user_id);
exception when others then
  null;
end $$;

alter table campus_channels enable row level security;
alter table campus_channel_members enable row level security;
alter table campus_messages enable row level security;

-- Admission gate: only admitted users can read/participate.
drop policy if exists "campus_channels_read_admitted" on campus_channels;
create policy "campus_channels_read_admitted"
  on campus_channels for select
  using (exists (select 1 from public.admissions a where a.user_id = auth.uid()));

drop policy if exists "campus_channel_members_read_admitted" on campus_channel_members;
create policy "campus_channel_members_read_admitted"
  on campus_channel_members for select
  using (exists (select 1 from public.admissions a where a.user_id = auth.uid()));

drop policy if exists "campus_messages_read_member" on campus_messages;
create policy "campus_messages_read_member"
  on campus_messages for select
  using (
    exists (select 1 from public.admissions a where a.user_id = auth.uid())
    and exists (
      select 1 from public.campus_channel_members m
      where m.channel_id = campus_messages.channel_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "campus_messages_insert_member" on campus_messages;
create policy "campus_messages_insert_member"
  on campus_messages for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.admissions a where a.user_id = auth.uid())
    and exists (
      select 1 from public.campus_channel_members m
      where m.channel_id = campus_messages.channel_id and m.user_id = auth.uid()
    )
  );

-- Allow admitted users to create channels and join them (MVP).
drop policy if exists "campus_channels_insert_admitted" on campus_channels;
create policy "campus_channels_insert_admitted"
  on campus_channels for insert
  with check (
    exists (select 1 from public.admissions a where a.user_id = auth.uid())
  );

drop policy if exists "campus_channel_members_insert_own" on campus_channel_members;
create policy "campus_channel_members_insert_own"
  on campus_channel_members for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.admissions a where a.user_id = auth.uid())
  );

-- Seed default public channels (idempotent)
insert into campus_channels (slug, name, kind)
values
  ('general', 'General', 'public'),
  ('economics', 'Economics', 'public'),
  ('monetary-theory', 'Monetary theory', 'public'),
  ('introductions', 'Introductions', 'public')
on conflict (slug) do update set name = excluded.name;

