const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

function readRepoEnv() {
  const p = path.resolve(process.cwd(), '..', '..', '.env.local')
  return fs.readFileSync(p, 'utf8')
}

function getEnvValue(envText, key) {
  const m = envText.match(new RegExp(`^${key}=(.*)$`, 'm'))
  if (!m) return null
  let v = m[1].trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  return v
}

async function main() {
  const env = readRepoEnv()
  const pw = getEnvValue(env, 'SUPABASE_DB_PASSWORD')
  const supabaseUrl = getEnvValue(env, 'NEXT_PUBLIC_SUPABASE_URL')
  const ref = new URL(supabaseUrl).hostname.split('.')[0]

  const cfg = {
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: pw,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  }

  const c = new Client(cfg)
  await c.connect()
  const r = await c.query("select relrowsecurity, relforcerowsecurity from pg_class where oid='public.courses'::regclass")
  const pol = await c.query(
    "select policyname, permissive, cmd from pg_policies where schemaname='public' and tablename='courses'"
  )
  await c.end()

  console.log(JSON.stringify({ ref, rls: r.rows[0], policies: pol.rows }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

