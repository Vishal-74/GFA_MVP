-- MCQ exercises as lecture rows (content_kind = 'mcq_quiz'). Run once on existing DBs.

alter table lectures alter column mux_asset_id drop not null;

alter table lectures add column if not exists content_kind text not null default 'video';

alter table lectures add column if not exists mcq jsonb;

update lectures set content_kind = 'video' where content_kind is null;
