-- Enable pgvector for AI embeddings
create extension if not exists vector;

-- Courses (seeded manually by admin)
create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  lecturer_name text,
  lecturer_bio text,
  price_cents int not null default 14900,
  mux_playlist_id text,
  catalog_emoji text default '📘',
  estimated_hours int,
  created_at timestamptz default now()
);

-- Lectures within a course (group into modules via module_sequence + module_title).
-- content_kind 'mcq_quiz' = chapter exercise; mux_asset_id null; mcq holds JSON questions.
create table lectures (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  mux_asset_id text,
  transcript text,
  order_index int not null,
  module_sequence int not null default 1,
  module_title text,
  content_kind text not null default 'video',
  mcq jsonb,
  created_at timestamptz default now()
);

-- Embeddings for AI bot (one row per ~500-token chunk)
create table lecture_chunks (
  id uuid primary key default gen_random_uuid(),
  lecture_id uuid references lectures(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  content text not null,
  embedding vector(768)
);
create index on lecture_chunks using ivfflat (embedding vector_cosine_ops);

-- Enrollments (created after Stripe payment)
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  course_id uuid references courses(id),
  stripe_session_id text,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- Per-lecture progress
create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  lecture_id uuid references lectures(id),
  watched_seconds int default 0,
  completed boolean default false,
  unique(user_id, lecture_id)
);

-- Exams
create table exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  course_id uuid references courses(id),
  status text default 'pending',
  submission_url text,
  feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz
);

-- Row Level Security — users only see their own data
alter table enrollments enable row level security;
alter table progress enable row level security;
alter table exams enable row level security;

create policy "users own enrollments" on enrollments for all using (auth.uid() = user_id);
create policy "users own progress" on progress for all using (auth.uid() = user_id);
create policy "users own exams" on exams for all using (auth.uid() = user_id);

-- Platform extensions (admission, lecture access, programs, faculties, simulated orders):
-- apply `supabase/migration-gfa-platform-v1.sql` and `supabase/seed-gfa-platform.sql` after this file.
