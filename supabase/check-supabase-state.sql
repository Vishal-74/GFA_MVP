-- Run in Supabase → SQL. Read-only: shows what you already have (no changes).

-- 1) Lectures table: module + MCQ columns?
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'lectures'
order by ordinal_position;

-- 2) Courses: emoji / hours?
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'courses' and column_name in ('catalog_emoji', 'estimated_hours');

-- 3) Embedding column width (768 = current app; 1536 = old)
select
  a.attname as column_name,
  format_type(a.atttypid, a.atttypmod) as type_with_mod
from pg_attribute a
join pg_class c on c.oid = a.attrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'lecture_chunks' and a.attname = 'embedding' and not a.attisdropped;

-- 4) match_chunks argument type (should be vector(768) with current code)
select pg_get_functiondef(oid) as definition
from pg_proc
where proname = 'match_chunks'
limit 1;

-- 5) Row counts (data present?)
select (select count(*) from courses) as courses, (select count(*) from lectures) as lectures, (select count(*) from lecture_chunks) as chunks;
