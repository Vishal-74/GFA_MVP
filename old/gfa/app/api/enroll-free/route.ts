import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json()
    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, price_cents')
      .eq('id', courseId)
      .maybeSingle()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.price_cents !== 0) {
      return NextResponse.json({ error: 'This course is not free' }, { status: 403 })
    }

    const { error: enrollError } = await supabase.from('enrollments').upsert(
      {
        user_id: user.id,
        course_id: courseId,
        stripe_session_id: 'free-enroll',
      },
      { onConflict: 'user_id,course_id' }
    )

    if (enrollError) {
      console.error('enroll-free:', enrollError)
      return NextResponse.json({ error: 'Could not enroll' }, { status: 500 })
    }

    const { error: accessError } = await supabase.from('lecture_access').upsert(
      {
        user_id: user.id,
        course_id: courseId,
        source: 'free_enroll',
      },
      { onConflict: 'user_id,course_id' }
    )

    if (accessError) {
      console.error('enroll-free lecture_access:', accessError)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
