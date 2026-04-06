/**
 * Creates a confirmed demo user, enrolls them in all seed courses, sample progress, optional passed exam.
 * Run: cd gfa && npm run seed:demo
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: SEED_DEMO_EMAIL, SEED_DEMO_PASSWORD (default demo@gfa.local / demo123456)
 */

import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrlForScripts, loadEnvForScripts } from './load-env-for-scripts'

loadEnvForScripts()

async function main() {
  const url = getSupabaseUrlForScripts()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key || key.includes('your_')) {
    console.error(
      'Need a valid NEXT_PUBLIC_SUPABASE_URL (https://….supabase.co) and SUPABASE_SERVICE_ROLE_KEY.\n' +
        'Put them in gfa/.env.local or the parent folder .env.local (parent overrides gfa placeholders).'
    )
    process.exit(1)
  }

  const email = process.env.SEED_DEMO_EMAIL || 'demo@gfa.local'
  const password = process.env.SEED_DEMO_PASSWORD || 'demo123456'

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  const { data: courseRows, error: coursesErr } = await admin
    .from('courses')
    .select('id, slug, price_cents')
    .order('created_at', { ascending: true })

  if (coursesErr || !courseRows?.length) {
    console.error('Could not load courses. Run seed.sql first.', coursesErr?.message)
    process.exit(1)
  }

  const courseIds = courseRows.map((c) => c.id)
  const freeCourse =
    courseRows.find((c) => c.price_cents === 0) ?? courseRows[0]

  const { data: firstLecture, error: lecErr } = await admin
    .from('lectures')
    .select('id')
    .eq('course_id', freeCourse.id)
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (lecErr || !firstLecture) {
    console.error('Could not find first lecture for free course.', lecErr?.message)
    process.exit(1)
  }

  let userId: string

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Demo Student' },
  })

  if (createErr) {
    const msg = createErr.message || ''
    if (msg.includes('already been registered') || msg.includes('already exists')) {
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 })
      if (listErr) {
        console.error(listErr.message)
        process.exit(1)
      }
      const found = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
      if (!found) {
        console.error('User exists but could not be found in listUsers:', msg)
        process.exit(1)
      }
      userId = found.id
      console.log('Demo user already exists:', email)
    } else {
      console.error(createErr.message)
      process.exit(1)
    }
  } else {
    userId = created.user!.id
    console.log('Created demo user:', email)
  }

  for (const courseId of courseIds) {
    const { error } = await admin.from('enrollments').upsert(
      {
        user_id: userId,
        course_id: courseId,
        stripe_session_id: 'seed-demo',
      },
      { onConflict: 'user_id,course_id' }
    )
    if (error) {
      console.error('Enrollment failed:', courseId, error.message)
      process.exit(1)
    }
  }
  console.log('Enrolled in', courseIds.length, 'courses')

  await admin.from('progress').upsert(
    {
      user_id: userId,
      lecture_id: firstLecture.id,
      completed: true,
      watched_seconds: 120,
    },
    { onConflict: 'user_id,lecture_id' }
  )
  console.log('Set sample progress on first lecture of', freeCourse.slug)

  await admin.from('exams').delete().eq('user_id', userId).eq('course_id', freeCourse.id)
  const { error: examErr } = await admin.from('exams').insert({
    user_id: userId,
    course_id: freeCourse.id,
    status: 'passed',
    feedback:
      'Strong grasp of core distinctions between liberty and license. Keep connecting theory to current events.',
    submitted_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString(),
  })
  if (examErr) {
    console.warn('Could not seed passed exam (optional):', examErr.message)
  } else {
    console.log('Seeded passed exam for', freeCourse.slug, '(certificate on /exam/[id])')
  }

  console.log('\n── Login ──')
  console.log('  Email:', email)
  console.log('  Password:', password)
  console.log('── Tip: disable “Confirm email” in Supabase Auth for frictionless signups, or confirm in dashboard.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
