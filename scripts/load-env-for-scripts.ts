import { readFileSync, existsSync } from 'fs'
import { dirname, join, resolve } from 'path'

function applyEnvFile(content: string, override: boolean) {
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (override || process.env[key] === undefined) {
      process.env[key] = val
    }
  }
}

const MAX_ENV_WALK = 10

/**
 * Loads every `.env.local` found walking up from cwd (then applies outer → inner so deeper files win).
 * Covers: `cd old/gfa && npm run …`, running from repo root, and `npm --prefix old/gfa run …` (cwd may be root).
 */
export function loadEnvForScripts() {
  let dir = resolve(process.cwd())
  const chain: string[] = []
  for (let i = 0; i < MAX_ENV_WALK; i++) {
    chain.push(join(dir, '.env.local'))
    const up = dirname(dir)
    if (up === dir) break
    dir = up
  }
  for (const p of [...chain].reverse()) {
    if (existsSync(p)) applyEnvFile(readFileSync(p, 'utf8'), true)
  }
}

export function getSupabaseUrlForScripts(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw) return null
  try {
    const u = new URL(raw.replace(/\/+$/, ''))
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.toString().replace(/\/+$/, '')
  } catch {
    return null
  }
}
