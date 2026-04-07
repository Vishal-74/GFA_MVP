import {
  sendExamSubmittedAdmin,
  sendExamSubmittedStudent,
} from '@/lib/email'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase-env'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await req.json()
    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json({ error: 'courseId required' }, { status: 400 })
    }

    const url = getSupabaseUrl()
    const anon = getSupabaseAnonKey()
    const supabase = createClient(url, anon)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user?.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .maybeSingle()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    await sendExamSubmittedStudent(user.email, course.title)
    await sendExamSubmittedAdmin(course.title, user.email, user.id)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('notify-exam-submitted:', e)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
