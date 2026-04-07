/**
 * Chunk lecture transcripts, embed (Gemini or OpenAI), write to lecture_chunks for RAG.
 *
 * Run: cd gfa && npm run embed:lectures
 * Requires: GEMINI_API_KEY or OPENAI_API_KEY (non-placeholder), plus Supabase service URL/key.
 * DB vectors must be dimension 768 (see schema + match_chunks).
 *
 * Options:
 *   --course=<uuid>   Only lectures in this course
 *   --append          Keep existing chunks (default: clear each lecture's chunks first)
 */

import { createClient } from '@supabase/supabase-js'
import { embedDocuments, resolveAiBackend } from '@/lib/ai-provider'
import { getSupabaseUrlForScripts, loadEnvForScripts } from './load-env-for-scripts'

loadEnvForScripts()

const MAX_CHUNK_CHARS = 1800
const EMBED_BATCH = 16

function chunkTranscript(text: string): string[] {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const out: string[] = []
  let cur = ''

  const pushCur = () => {
    if (cur) {
      out.push(cur)
      cur = ''
    }
  }

  for (const p of paras) {
    if (p.length > MAX_CHUNK_CHARS) {
      pushCur()
      for (let i = 0; i < p.length; i += MAX_CHUNK_CHARS) {
        out.push(p.slice(i, i + MAX_CHUNK_CHARS))
      }
      continue
    }
    if (cur.length + p.length + 2 <= MAX_CHUNK_CHARS) {
      cur = cur ? `${cur}\n\n${p}` : p
    } else {
      pushCur()
      cur = p
    }
  }
  pushCur()
  return out
}

async function main() {
  const args = process.argv.slice(2)
  const courseFilter = args.find((a) => a.startsWith('--course='))?.split('=')[1]
  const append = args.includes('--append')

  const url = getSupabaseUrlForScripts()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    console.error(
      'Missing valid NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
        'Use gfa/.env.local or parent .env.local (parent overrides placeholders).'
    )
    process.exit(1)
  }

  if (!resolveAiBackend()) {
    console.error(
      'Set GEMINI_API_KEY or OPENAI_API_KEY to a real key in .env.local (not the your_* placeholder).\n' +
        'If both are set, Gemini is used first.'
    )
    process.exit(1)
  }

  const supabase = createClient(url, key)

  // Only rows with a transcript are embedded. MCQ-only lessons use null transcript, so no DB column needed.
  let q = supabase
    .from('lectures')
    .select('id, course_id, title, transcript')
    .not('transcript', 'is', null)

  if (courseFilter) q = q.eq('course_id', courseFilter)

  const { data: lectures, error } = await q
  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  const rows = (lectures || []).filter((l) => l.transcript && l.transcript.trim().length > 0)
  console.log(`Embedding ${rows.length} lectures (${resolveAiBackend()})…`)

  for (const lec of rows) {
    const chunks = chunkTranscript(lec.transcript as string)
    if (chunks.length === 0) continue

    if (!append) {
      await supabase.from('lecture_chunks').delete().eq('lecture_id', lec.id)
    }

    console.log(`  ${lec.title}: ${chunks.length} chunks`)

    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
      const batch = chunks.slice(i, i + EMBED_BATCH)
      const vectors = await embedDocuments(batch)
      const inserts = batch.map((content, j) => ({
        lecture_id: lec.id,
        course_id: lec.course_id,
        content,
        embedding: `[${(vectors[j] as number[]).join(',')}]`,
      }))

      const { error: insErr } = await supabase.from('lecture_chunks').insert(inserts)
      if (insErr) {
        console.error('Insert failed:', insErr.message)
        process.exit(1)
      }
    }
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
