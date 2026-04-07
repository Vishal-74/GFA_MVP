-- Optional: catalog lesson counts when RLS returns zero rows for direct `lectures` queries (all zeros).
-- The app loads counts via `lectures` first; it only calls this RPC when that total is 0.
-- Apply in Supabase SQL Editor (or via migration runner). Safe: returns only aggregates, no transcript/mcq.

create or replace function public.gfa_course_lesson_counts(p_course_ids uuid[])
returns table (course_id uuid, lesson_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select l.course_id, count(*)::bigint
  from public.lectures l
  where l.course_id = any(p_course_ids)
  group by l.course_id;
$$;

comment on function public.gfa_course_lesson_counts(uuid[]) is
  'Aggregated lesson counts per course for /courses catalog; callable by anon.';

grant execute on function public.gfa_course_lesson_counts(uuid[]) to anon, authenticated;
