-- If `programs` already existed before GFA, `CREATE TABLE IF NOT EXISTS` skipped creation
-- and columns like `kind` are missing. Add GFA columns without dropping unrelated tables.

alter table public.programs add column if not exists slug text;
alter table public.programs add column if not exists title text;
alter table public.programs add column if not exists kind text;
alter table public.programs add column if not exists description text;
alter table public.programs add column if not exists semester_count int;
alter table public.programs add column if not exists lecture_series_count int;
alter table public.programs add column if not exists created_at timestamptz default now();

alter table public.programs drop constraint if exists programs_kind_check;
alter table public.programs
  add constraint programs_kind_check
  check (kind is null or kind in ('bachelor', 'master', 'mba'));
