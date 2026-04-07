-- GFA platform v1: admission gating, lecture access, programs, faculties, orders (simulated + Stripe).
-- Run after schema.sql, functions.sql, and prior lecture migrations on existing projects.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  locale text default 'en',
  role text not null default 'student' check (role in ('student', 'lecturer', 'admin')),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_insert_own" on profiles;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Lecturers (instructor offices; may differ from auth users)
-- ---------------------------------------------------------------------------
create table if not exists lecturers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  bio text,
  office_intro_mux_playback_id text,
  social_links jsonb default '{}'::jsonb,
  languages text[] default array['en']::text[],
  created_at timestamptz default now()
);

alter table lecturers enable row level security;
drop policy if exists "lecturers_read_all" on lecturers;
create policy "lecturers_read_all" on lecturers for select using (true);

-- ---------------------------------------------------------------------------
-- Courses: link to public.lecturers (instructor offices), NOT auth.users.
-- If lecturer_id already existed referencing users, DROP + re-ADD fixes seed updates.
-- ---------------------------------------------------------------------------
alter table public.courses drop constraint if exists courses_lecturer_id_fkey;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'lecturer_id'
  ) then
    alter table public.courses add column lecturer_id uuid;
  end if;
end $$;

alter table public.courses
  add constraint courses_lecturer_id_fkey
  foreign key (lecturer_id) references public.lecturers (id) on delete set null;

alter table courses add column if not exists lecture_series_price_cents int;
alter table courses add column if not exists lecture_series_currency text default 'eur';

-- ---------------------------------------------------------------------------
-- Faculties & instructor placement
-- ---------------------------------------------------------------------------
create table if not exists faculties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

alter table faculties enable row level security;
drop policy if exists "faculties_read_all" on faculties;
create policy "faculties_read_all" on faculties for select using (true);

create table if not exists faculty_lecturers (
  faculty_id uuid not null references faculties (id) on delete cascade,
  lecturer_id uuid not null references lecturers (id) on delete cascade,
  sort_order int not null default 0,
  primary key (faculty_id, lecturer_id)
);

alter table faculty_lecturers enable row level security;
drop policy if exists "faculty_lecturers_read_all" on faculty_lecturers;
create policy "faculty_lecturers_read_all" on faculty_lecturers for select using (true);

-- ---------------------------------------------------------------------------
-- Degree programs (Bachelor / Master scaffold)
-- ---------------------------------------------------------------------------
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text not null check (kind in ('bachelor', 'master', 'mba')),
  description text,
  semester_count int,
  lecture_series_count int,
  created_at timestamptz default now()
);

alter table programs enable row level security;
drop policy if exists "programs_read_all" on programs;
create policy "programs_read_all" on programs for select using (true);

create table if not exists program_courses (
  program_id uuid not null references programs (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  sequence_order int not null,
  primary key (program_id, course_id)
);

alter table program_courses enable row level security;
drop policy if exists "program_courses_read_all" on program_courses;
create policy "program_courses_read_all" on program_courses for select using (true);

create table if not exists program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null references programs (id) on delete cascade,
  started_at timestamptz default now(),
  unique (user_id, program_id)
);

alter table program_enrollments enable row level security;
drop policy if exists "program_enrollments_own" on program_enrollments;
create policy "program_enrollments_own" on program_enrollments for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Pricing catalogue (admission USD, lecture series EUR per PDF)
-- ---------------------------------------------------------------------------
create table if not exists pricing_items (
  code text primary key,
  label text not null,
  amount_cents int not null,
  currency text not null default 'usd'
);

alter table pricing_items enable row level security;
drop policy if exists "pricing_items_read_all" on pricing_items;
create policy "pricing_items_read_all" on pricing_items for select using (true);

-- ---------------------------------------------------------------------------
-- Orders (created/updated via service role from API; users read own)
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  provider text not null default 'simulated' check (provider in ('simulated', 'stripe')),
  currency text,
  total_amount_cents int,
  created_at timestamptz default now(),
  paid_at timestamptz
);

alter table orders enable row level security;
drop policy if exists "orders_select_own" on orders;
create policy "orders_select_own" on orders for select using (auth.uid() = user_id);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  sku text not null,
  pricing_item_code text references pricing_items (code),
  course_id uuid references courses (id) on delete set null,
  unit_amount_cents int not null,
  quantity int not null default 1
);

alter table order_items enable row level security;
drop policy if exists "order_items_select_own" on order_items;
create policy "order_items_select_own" on order_items for select using (
  exists (
    select 1 from orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- Admission: one-time global unlock (exams, community, library, office hours)
-- ---------------------------------------------------------------------------
create table if not exists admissions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  paid_at timestamptz not null default now(),
  order_id uuid references orders (id) on delete set null
);

alter table admissions enable row level security;
drop policy if exists "admissions_select_own" on admissions;
create policy "admissions_select_own" on admissions for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Lecture-series entitlement (watch videos; separate from admission)
-- ---------------------------------------------------------------------------
create table if not exists lecture_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  source text not null default 'purchase' check (source in ('purchase', 'free_enroll', 'admin_grant', 'legacy_enrollment')),
  order_id uuid references orders (id) on delete set null,
  created_at timestamptz default now(),
  unique (user_id, course_id)
);

alter table lecture_access enable row level security;
drop policy if exists "lecture_access_select_own" on lecture_access;
create policy "lecture_access_select_own" on lecture_access for select using (auth.uid() = user_id);

drop policy if exists "lecture_access_insert_own" on lecture_access;
create policy "lecture_access_insert_own" on lecture_access for insert with check (auth.uid() = user_id);

drop policy if exists "lecture_access_update_own" on lecture_access;
create policy "lecture_access_update_own" on lecture_access for update using (auth.uid() = user_id);

create index if not exists idx_program_courses_program on program_courses (program_id);
create index if not exists idx_lecture_access_user on lecture_access (user_id);
create index if not exists idx_courses_lecturer on courses (lecturer_id);
