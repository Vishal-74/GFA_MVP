-- One-off repair: courses.lecturer_id must reference public.lecturers, not public.users / auth.users.
-- Use when seed-gfa-platform.sql fails with:
--   ERROR: 23503: insert or update on table "courses" violates foreign key constraint "courses_lecturer_id_fkey"
--   DETAIL: Key (lecturer_id)=(...) is not present in table "users".
--
-- Prerequisites: migration-gfa-platform-v1.sql has been run (public.lecturers exists).

alter table public.courses drop constraint if exists courses_lecturer_id_fkey;

alter table public.courses
  add constraint courses_lecturer_id_fkey
  foreign key (lecturer_id) references public.lecturers (id) on delete set null;
