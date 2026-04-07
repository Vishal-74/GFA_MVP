-- Exam scheduling requests (MVP): student requests a slot; instructor/admin handles externally for now.
-- This supports the Examination Center UX and audit trail; video-call integration is Phase 2.

create table if not exists exam_schedule_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  level text not null default 'bachelor' check (level in ('bachelor', 'master')),
  preferred_times_text text,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_exam_schedule_requests_user on exam_schedule_requests (user_id);
create index if not exists idx_exam_schedule_requests_course on exam_schedule_requests (course_id);
create index if not exists idx_exam_schedule_requests_status on exam_schedule_requests (status);

alter table exam_schedule_requests enable row level security;

drop policy if exists "exam_schedule_requests_select_own" on exam_schedule_requests;
create policy "exam_schedule_requests_select_own"
  on exam_schedule_requests for select
  using (auth.uid() = user_id);

drop policy if exists "exam_schedule_requests_insert_own" on exam_schedule_requests;
create policy "exam_schedule_requests_insert_own"
  on exam_schedule_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "exam_schedule_requests_update_own" on exam_schedule_requests;
create policy "exam_schedule_requests_update_own"
  on exam_schedule_requests for update
  using (auth.uid() = user_id);

