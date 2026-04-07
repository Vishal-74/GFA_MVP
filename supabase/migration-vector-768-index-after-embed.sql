-- Run in Supabase SQL editor AFTER `npm run embed:lectures` (ivfflat works best once rows exist).
CREATE INDEX IF NOT EXISTS lecture_chunks_embedding_idx ON lecture_chunks USING ivfflat (embedding vector_cosine_ops);
