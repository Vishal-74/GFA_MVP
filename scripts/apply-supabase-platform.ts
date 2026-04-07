/**
 * Applies GFA platform SQL to your Supabase Postgres instance.
 *
 * Loads env from ./.env.local then ../.env.local (see load-env-for-scripts).
 *
 * Auth: NOT the Supabase API keys — you need a direct Postgres connection:
 *   - DATABASE_URL or SUPABASE_DB_URL (full URI), OR
 *   - SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL
 *
 * Database password: Supabase Dashboard → Project Settings → Database → Database password
 * (Reset if needed; this is NOT the anon/service_role JWT.)
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Client } from 'pg'
import { loadEnvForScripts, getSupabaseUrlForScripts } from './load-env-for-scripts'

loadEnvForScripts()

function printConnectionHelp(): never {
  console.error(`
Missing Postgres connection. Add ONE of the following to .env.local (repo root or old/gfa):

  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

  OR

  SUPABASE_DB_PASSWORD=YOUR_PASSWORD
  (NEXT_PUBLIC_SUPABASE_URL is already used to derive host db.<ref>.supabase.co)

Password: Supabase Dashboard → Settings → Database → Database password
`)
  process.exit(1)
}

type PgConfig =
  | { connectionString: string; ssl?: { rejectUnauthorized: boolean } }
  | {
      host: string
      port: number
      user: string
      password: string
      database: string
      ssl: { rejectUnauthorized: boolean }
    }

function getPgConfig(): PgConfig {
  const direct = process.env.DATABASE_URL?.trim() || process.env.SUPABASE_DB_URL?.trim()
  if (direct) {
    return { connectionString: direct, ssl: { rejectUnauthorized: false } }
  }
  const password = process.env.SUPABASE_DB_PASSWORD?.trim()
  const base = getSupabaseUrlForScripts()
  if (!password || !base) {
    printConnectionHelp()
  }
  let host: string
  try {
    host = new URL(base).hostname
  } catch {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_URL')
    process.exit(1)
  }
  const refMatch = host.match(/^([a-z0-9]+)\.supabase\.co$/i)
  if (!refMatch) {
    console.error('Could not parse project ref from NEXT_PUBLIC_SUPABASE_URL host:', host)
    process.exit(1)
  }
  return {
    host: `db.${refMatch[1]}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  }
}

async function runFile(client: Client, label: string, absolutePath: string) {
  const sql = readFileSync(absolutePath, 'utf8')
  console.log(`\n→ ${label}`)
  await client.query(sql)
  console.log(`   OK`)
}

async function main() {
  const client = new Client(getPgConfig())
  const root = process.cwd()

  const files: { label: string; path: string }[] = [
    { label: 'migration-gfa-platform-v1.sql', path: resolve(root, 'supabase/migration-gfa-platform-v1.sql') },
    { label: 'migration-gfa-fix-courses-lecturer-fkey.sql', path: resolve(root, 'supabase/migration-gfa-fix-courses-lecturer-fkey.sql') },
    { label: 'migration-gfa-programs-table-align.sql', path: resolve(root, 'supabase/migration-gfa-programs-table-align.sql') },
    { label: 'migration-gfa-degree-programs.sql', path: resolve(root, 'supabase/migration-gfa-degree-programs.sql') },
    { label: 'migration-gfa-exam-fee-purchases.sql', path: resolve(root, 'supabase/migration-gfa-exam-fee-purchases.sql') },
    { label: 'migration-gfa-role-functions.sql', path: resolve(root, 'supabase/migration-gfa-role-functions.sql') },
    { label: 'migration-gfa-exam-scheduling-requests.sql', path: resolve(root, 'supabase/migration-gfa-exam-scheduling-requests.sql') },
    { label: 'migration-gfa-campus-messenger.sql', path: resolve(root, 'supabase/migration-gfa-campus-messenger.sql') },
    { label: 'migration-gfa-office-hours.sql', path: resolve(root, 'supabase/migration-gfa-office-hours.sql') },
    { label: 'migration-gfa-certificate-verification.sql', path: resolve(root, 'supabase/migration-gfa-certificate-verification.sql') },
    // Catalogue + lectures (must run before seed-gfa-platform so course slugs/titles match lecturer_id updates)
    { label: 'seed.sql', path: resolve(root, 'supabase/seed.sql') },
    { label: 'seed-gfa-platform.sql', path: resolve(root, 'supabase/seed-gfa-platform.sql') },
  ]

  try {
    await client.connect()
    console.log('Connected to Postgres.')
  } catch (e) {
    console.error('Connection failed. Check DATABASE_URL / password and network.', e)
    process.exit(1)
  }

  try {
    for (const f of files) {
      await runFile(client, f.label, f.path)
    }
    console.log('\nAll platform SQL files applied successfully.')
  } catch (e) {
    console.error('\nError running SQL:', e)
    process.exit(1)
  } finally {
    await client.end().catch(() => {})
  }
}

main()
