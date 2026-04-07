import { sendExamResultStudent } from '@/lib/email'
import { getSupabaseUrl, isSupabaseConfigured } from '@/lib/supabase-env'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * Call after updating an exam row in Supabase (e.g. status passed/failed).
 * Headers: Authorization: Bearer <GFA_INTERNAL_SECRET>
 * Body: { userId, courseId, status: "passed" | "failed", feedback?: string }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.GFA_INTERNAL_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { userId, courseId, status, feedback } = body as {
    userId?: string
    courseId?: string
    status?: string
    feedback?: string
  }

  if (!userId || !courseId || (status !== 'passed' && status !== 'failed')) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!isSupabaseConfigured() || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const admin = createClient(getSupabaseUrl(), serviceKey)
  const { data: userData, error: authErr } = await admin.auth.admin.getUserById(userId)
  if (authErr || !userData.user?.email) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: course, error: courseErr } = await admin
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .maybeSingle()

  if (courseErr || !course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  await sendExamResultStudent(
    userData.user.email,
    course.title,
    status === 'passed',
    feedback ?? null
  )

  // MVP: create a verification hash record on pass (idempotent per user+course).
  if (status === 'passed') {
    const hash = crypto
      .createHash('sha256')
      .update(`${userId}:${courseId}:${process.env.GFA_INTERNAL_SECRET || ''}`)
      .digest('hex')
      .slice(0, 32)

    await admin.from('certificate_verifications').upsert(
      {
        hash,
        user_id: userId,
        course_id: courseId,
      },
      { onConflict: 'hash' }
    )
  }

  return NextResponse.json({ ok: true })
}
