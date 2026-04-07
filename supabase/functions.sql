-- Add this function to Supabase (run in SQL editor after creating the schema)

create or replace function match_chunks(
  query_embedding vector(768),
  match_course_id uuid,
  match_count int default 5
)
returns table (content text, similarity float)
language sql stable
as $$
  select content, 1 - (embedding <=> query_embedding) as similarity
  from lecture_chunks
  where course_id = match_course_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
