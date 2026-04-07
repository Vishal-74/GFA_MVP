-- Office hours (MVP): instructors publish slots; admitted students book.
-- Video-call integration is a later milestone.

create table if not exists office_hours_slots (
  id uuid primary key default gen_random_uuid(),
  lecturer_id uuid not null references public.lecturers (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null default 1 check (capacity >= 1),
  created_at timestamptz not null default now()
);

create index if not exists idx_office_hours_slots_lecturer on office_hours_slots (lecturer_id, starts_at);

create table if not exists office_hours_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references office_hours_slots (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique (slot_id, user_id)
);

create index if not exists idx_office_hours_bookings_user on office_hours_bookings (user_id, created_at);

alter table office_hours_slots enable row level security;
alter table office_hours_bookings enable row level security;

-- Anyone can read slots (public discovery), but booking requires admission.
drop policy if exists "office_hours_slots_read_all" on office_hours_slots;
create policy "office_hours_slots_read_all" on office_hours_slots for select using (true);

-- Instructors can create slots for themselves when their profile role is 'lecturer'
-- and they have a lecturer record with matching id stored in profiles.display_name? (MVP doesn't link auth users to lecturers.)
-- MVP policy: only admins can insert/update/delete slots for now.
drop policy if exists "office_hours_slots_admin_write" on office_hours_slots;
create policy "office_hours_slots_admin_write"
  on office_hours_slots for all
  using (has_role('admin'))
  with check (has_role('admin'));

-- Bookings: admitted students can insert/select their own.
drop policy if exists "office_hours_bookings_select_own" on office_hours_bookings;
create policy "office_hours_bookings_select_own"
  on office_hours_bookings for select
  using (auth.uid() = user_id);

drop policy if exists "office_hours_bookings_insert_admitted" on office_hours_bookings;
create policy "office_hours_bookings_insert_admitted"
  on office_hours_bookings for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.admissions a where a.user_id = auth.uid())
  );

