-- Certificate verification (MVP): verifiable hash + public lookup.
-- Generates a record when an exam is marked passed (done via API with service role in MVP).

create table if not exists certificate_verifications (
  id uuid primary key default gen_random_uuid(),
  hash text unique not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  issued_at timestamptz not null default now()
);

create index if not exists idx_certificate_verifications_user on certificate_verifications (user_id, issued_at);
create index if not exists idx_certificate_verifications_course on certificate_verifications (course_id, issued_at);

alter table certificate_verifications enable row level security;

drop policy if exists "certificate_verifications_read_all" on certificate_verifications;
create policy "certificate_verifications_read_all"
  on certificate_verifications for select
  using (true);

