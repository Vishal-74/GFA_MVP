const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

function envValue(key) {
  const env = fs.readFileSync(path.resolve(process.cwd(), '..', '..', '.env.local'), 'utf8')
  const m = env.match(new RegExp(`^${key}=(.*)$`, 'm'))
  if (!m) return null
  let v = m[1].trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  return v
}

async function main() {
  const pw = envValue('SUPABASE_DB_PASSWORD')
  const url = envValue('NEXT_PUBLIC_SUPABASE_URL')
  const ref = new URL(url).hostname.split('.')[0]
  const c = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: pw,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  })
  await c.connect()
  const cols = await c.query(
    "select column_name, data_type, column_default from information_schema.columns where table_schema='public' and table_name='courses' order by ordinal_position"
  )
  await c.end()
  console.log(cols.rows)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

