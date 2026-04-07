/** Valid URL for local dev when env is missing or malformed (Supabase client requires http/https). */
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'

const PLACEHOLDER_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Supabase project URL from env, or placeholder if unset / invalid. */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw || !isValidHttpUrl(raw)) return PLACEHOLDER_URL
  return raw.replace(/\/+$/, '')
}

export function getSupabaseAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!raw) return PLACEHOLDER_ANON_KEY
  return raw
}

/** True when env has a real URL + key (not coerced placeholders). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return Boolean(url && key && isValidHttpUrl(url))
}

/** Hostname from `NEXT_PUBLIC_SUPABASE_URL` for error hints (e.g. in dev). */
export function getSupabaseUrlHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw) return null
  try {
    return new URL(raw).host
  } catch {
    return null
  }
}
