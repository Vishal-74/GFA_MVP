import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase-env'

function parseDocumentCookies(): { name: string; value: string }[] {
  if (typeof document === 'undefined') return []
  const raw = document.cookie ?? ''
  if (!raw) return []
  return raw
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf('=')
      if (idx === -1) return { name: pair, value: '' }
      return { name: pair.slice(0, idx), value: pair.slice(idx + 1) }
    })
}

function serializeCookie(
  name: string,
  value: string,
  options?: {
    path?: string
    domain?: string
    maxAge?: number
    expires?: Date
    sameSite?: 'lax' | 'strict' | 'none'
    secure?: boolean
  }
) {
  const enc = (v: string) => encodeURIComponent(v)
  let out = `${enc(name)}=${enc(value)}`
  if (options?.maxAge != null) out += `; Max-Age=${options.maxAge}`
  if (options?.expires) out += `; Expires=${options.expires.toUTCString()}`
  out += `; Path=${options?.path ?? '/'}`
  if (options?.domain) out += `; Domain=${options.domain}`
  if (options?.sameSite) out += `; SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`
  if (options?.secure) out += '; Secure'
  return out
}

export const supabase = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  cookies: {
    getAll() {
      return parseDocumentCookies()
    },
    setAll(cookiesToSet) {
      if (typeof document === 'undefined') return
      cookiesToSet.forEach(({ name, value, options }) => {
        document.cookie = serializeCookie(name, value, options as any)
      })
    },
  },
})

export type Course = {
  id: string
  slug: string
  title: string
  description?: string
  lecturer_name?: string
  lecturer_bio?: string
  price_cents: number
  mux_playlist_id?: string
  catalog_emoji?: string | null
  estimated_hours?: number | null
  created_at: string
}

export type Lecture = {
  id: string
  course_id: string
  title: string
  mux_asset_id?: string | null
  transcript?: string
  order_index: number
  module_sequence?: number
  module_title?: string | null
  content_kind?: string
  mcq?: unknown
  created_at: string
}

export type Enrollment = {
  id: string
  user_id: string
  course_id: string
  stripe_session_id?: string
  enrolled_at: string
}

export type Progress = {
  id: string
  user_id: string
  lecture_id: string
  watched_seconds: number
  completed: boolean
}

export type Exam = {
  id: string
  user_id: string
  course_id: string
  status: 'pending' | 'submitted' | 'passed' | 'failed'
  submission_url?: string
  feedback?: string
  submitted_at?: string
  reviewed_at?: string
}
