-- Fix: "expected 1536 dimensions, not 768" after switching to Gemini / 768-dim embeddings.
-- Run the whole script once in Supabase → SQL → New query, then run:
--   cd gfa && npm run embed:lectures

-- Drop any secondary indexes on lecture_chunks (name varies: lecture_chunks_embedding_idx, etc.)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS sch, c2.relname AS ix
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indrelid
    JOIN pg_class c2 ON c2.oid = i.indexrelid
    JOIN pg_namespace n ON n.oid = c2.relnamespace
    WHERE c.relname = 'lecture_chunks'
      AND n.nspname = 'public'
      AND NOT i.indisprimary
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.sch, r.ix);
  END LOOP;
END $$;

TRUNCATE lecture_chunks;

-- Safer than ALTER TYPE when changing dimensions
ALTER TABLE lecture_chunks DROP COLUMN embedding;
ALTER TABLE lecture_chunks ADD COLUMN embedding vector(768);

CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(768),
  match_course_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (content text, similarity float)
LANGUAGE sql
STABLE
AS $$
  SELECT content, 1 - (embedding <=> query_embedding) AS similarity
  FROM lecture_chunks
  WHERE course_id = match_course_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
