import type { SupabaseClient } from '@supabase/supabase-js'

export function sumLessonCounts(map: Map<string, number>): number {
  let n = 0
  for (const v of map.values()) n += v
  return n
}

function hashIdToPositiveInt(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Split a total lesson count across course ids into uneven positive integers that sum to `total`. */
export function divideTotalUnevenlyAcrossCourses(total: number, courseIds: string[]): Map<string, number> {
  const n = courseIds.length
  const out = new Map<string, number>()
  if (n === 0) return out
  if (total <= 0) {
    for (const id of courseIds) out.set(id, 0)
    return out
  }

  const weights = courseIds.map((id) => (hashIdToPositiveInt(id) % 10000) + 1)
  const sumW = weights.reduce((a, b) => a + b, 0)
  const exact = weights.map((w) => (total * w) / sumW)
  const floors = exact.map((x) => Math.floor(x))
  let remainder = total - floors.reduce((a, b) => a + b, 0)
  const order = floors
    .map((f, i) => ({ i, frac: exact[i] - f }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
  const alloc = [...floors]
  let k = 0
  while (remainder > 0) {
    alloc[order[k % n].i] += 1
    remainder -= 1
    k += 1
  }
  courseIds.forEach((id, i) => out.set(id, alloc[i]))
  return out
}

type RpcLessonRow = { course_id: string; lesson_count: number | string }

async function loadLectureRowsChunked(
  courseIds: string[],
  client: SupabaseClient
): Promise<{ map: Map<string, number>; error: { message: string } | null }> {
  const map = new Map<string, number>()
  if (courseIds.length === 0) return { map, error: null }
  const chunkSize = 100
  for (let i = 0; i < courseIds.length; i += chunkSize) {
    const chunk = courseIds.slice(i, i + chunkSize)
    const res = await client.from('lectures').select('course_id').in('course_id', chunk)
    if (res.error) return { map, error: res.error }
    for (const row of res.data ?? []) {
      const id = row.course_id as string
      map.set(id, (map.get(id) ?? 0) + 1)
    }
  }
  return { map, error: null }
}

/**
 * Per-course lecture counts from DB (anon or service client), with RPC fallback when direct reads return empty.
 */
export async function fetchLessonCountsByCourse(
  courseIds: string[],
  supabase: SupabaseClient,
  service: SupabaseClient | null
): Promise<{ map: Map<string, number>; error: { message: string } | null }> {
  if (courseIds.length === 0) return { map: new Map(), error: null }

  const client = service ?? supabase
  const first = await loadLectureRowsChunked(courseIds, client)
  let map = first.map
  let err = first.error

  if (!service && !first.error && sumLessonCounts(map) === 0) {
    const rpc = await supabase.rpc('gfa_course_lesson_counts', { p_course_ids: courseIds })
    if (!rpc.error && (rpc.data?.length ?? 0) > 0) {
      const next = new Map<string, number>()
      for (const row of (rpc.data ?? []) as RpcLessonRow[]) {
        next.set(row.course_id, Number(row.lesson_count))
      }
      map = next
      err = null
    }
  }

  return { map, error: err }
}
