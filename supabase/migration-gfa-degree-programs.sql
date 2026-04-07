-- Degree catalogue isolated from any legacy `programs` table (name collisions / wrong column types).
create table if not exists gfa_programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text not null check (kind in ('bachelor', 'master', 'mba')),
  description text,
  semester_count int,
  lecture_series_count int,
  created_at timestamptz default now()
);

alter table gfa_programs enable row level security;
drop policy if exists "gfa_programs_read_all" on gfa_programs;
create policy "gfa_programs_read_all" on gfa_programs for select using (true);

create table if not exists gfa_program_courses (
  program_id uuid not null references gfa_programs (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  sequence_order int not null,
  primary key (program_id, course_id)
);

alter table gfa_program_courses enable row level security;
drop policy if exists "gfa_program_courses_read_all" on gfa_program_courses;
create policy "gfa_program_courses_read_all" on gfa_program_courses for select using (true);

create index if not exists idx_gfa_program_courses_program on gfa_program_courses (program_id);
