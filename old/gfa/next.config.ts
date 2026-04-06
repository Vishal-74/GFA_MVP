import type { NextConfig } from "next"
import { existsSync, readFileSync } from "fs"
import path from "path"

/**
 * Merge `.env.local` from this app directory and every ancestor up to the filesystem root.
 * Next.js only auto-loads `.env.local` from `process.cwd()`; when the app lives in `old/gfa` but
 * secrets live in the repo root (`../../.env.local` from `old/gfa`), the browser client would
 * otherwise miss `NEXT_PUBLIC_SUPABASE_*` and fall back to a placeholder URL → "Failed to fetch"
 * on `signInWithPassword` / `signUp`.
 *
 * Outer files are applied first; nearer directories override (so `old/gfa/.env.local` wins over root).
 */
function mergeEnvLocalFile(absPath: string) {
  if (!existsSync(absPath)) return
  for (const line of readFileSync(absPath, "utf8").split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const eq = t.indexOf("=")
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

function mergeEnvFromAncestors(startDir: string, maxDepth = 12) {
  const resolved = path.resolve(startDir)
  const chain: string[] = []
  let dir = resolved
  for (let i = 0; i < maxDepth; i++) {
    chain.push(dir)
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  chain.reverse()
  for (const d of chain) {
    mergeEnvLocalFile(path.join(d, ".env.local"))
  }
}

const appDir = process.cwd()
mergeEnvFromAncestors(appDir)

// On Vercel, cwd is already the app root (`old/gfa`). Pointing tracing at the parent dir breaks
// serverless output resolution (e.g. ENOENT for `.next/routes-manifest-deterministic.json`).
// Keep monorepo lockfile tracing for local dev only.
const isVercel = Boolean(process.env.VERCEL)

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  ...(!isVercel && {
    outputFileTracingRoot: path.join(appDir, ".."),
  }),
}

export default nextConfig
