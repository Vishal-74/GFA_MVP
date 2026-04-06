import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrlForScripts, loadEnvForScripts } from '@/scripts/load-env-for-scripts'

type DemoUser = {
  email: string
  password: string
  displayName: string
  role: 'student' | 'admin'
}

async function ensureUser(
  admin: ReturnType<typeof createClient>,
  user: DemoUser
): Promise<{ id: string; email: string }> {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listErr) throw listErr

  const existing = list.users.find((u) => (u.email ?? '').toLowerCase() === user.email.toLowerCase())

  if (existing) {
    const { data: updated, error: updateErr } = await admin.auth.admin.updateUserById(existing.id, {
      password: user.password,
      user_metadata: { full_name: user.displayName },
    })
    if (updateErr) throw updateErr
    return { id: updated.user.id, email: updated.user.email ?? user.email }
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.displayName },
  })
  if (createErr) throw createErr
  return { id: created.user.id, email: created.user.email ?? user.email }
}

async function ensureProfile(
  admin: ReturnType<typeof createClient>,
  userId: string,
  user: DemoUser
): Promise<void> {
  const { error } = await admin.from('profiles').upsert(
    {
      id: userId,
      display_name: user.displayName,
      role: user.role,
      locale: 'en',
    },
    { onConflict: 'id' }
  )
  if (error) throw error
}

async function main() {
  loadEnvForScripts()

  const url = getSupabaseUrlForScripts()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  }
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local (required to create Auth users).')
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const demo: DemoUser[] = [
    {
      email: 'student@gfa.test',
      password: 'Student@12345',
      displayName: 'Demo Student',
      role: 'student',
    },
    {
      email: 'admin@gfa.test',
      password: 'Admin@12345',
      displayName: 'Demo Admin',
      role: 'admin',
    },
  ]

  for (const u of demo) {
    const { id } = await ensureUser(admin, u)
    await ensureProfile(admin, id, u)
  }

  // eslint-disable-next-line no-console
  console.log(
    [
      '✅ Demo logins ready:',
      '',
      'Student:',
      `  email: ${demo[0].email}`,
      `  password: ${demo[0].password}`,
      '',
      'Admin:',
      `  email: ${demo[1].email}`,
      `  password: ${demo[1].password}`,
    ].join('\n')
  )
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to create demo logins:', err?.message ?? err)
  process.exit(1)
})

