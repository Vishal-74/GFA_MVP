-- Run once in Supabase SQL Editor (safe to re-run with IF NOT EXISTS patterns below).

alter table courses add column if not exists catalog_emoji text default '📘';
alter table courses add column if not exists estimated_hours int;

alter table lectures add column if not exists module_sequence int not null default 1;
alter table lectures add column if not exists module_title text;

update courses set catalog_emoji = coalesce(catalog_emoji, '📘') where catalog_emoji is null;

-- Single-module default for rows that have no module title yet
update lectures set module_title = coalesce(module_title, 'Lessons'), module_sequence = 1 where module_title is null;
