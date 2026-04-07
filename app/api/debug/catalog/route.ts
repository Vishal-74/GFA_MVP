import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null
  try {
    const supabase = await createServerSupabase()
    const { count: coursesCount, error: coursesErr } = await supabase
      .from('courses')
      .select('id', { count: 'exact', head: true })
    const { count: facultiesCount, error: facultiesErr } = await supabase
      .from('faculties')
      .select('id', { count: 'exact', head: true })
    const { count: lecturersCount, error: lecturersErr } = await supabase
      .from('lecturers')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      supabaseUrl: url,
      coursesCount,
      facultiesCount,
      lecturersCount,
      errors: {
        courses: coursesErr ? { message: coursesErr.message, details: (coursesErr as any).details } : null,
        faculties: facultiesErr ? { message: facultiesErr.message, details: (facultiesErr as any).details } : null,
        lecturers: lecturersErr ? { message: lecturersErr.message, details: (lecturersErr as any).details } : null,
      },
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        supabaseUrl: url,
        error: e?.message || String(e),
        hint:
          'If this is a fetch/network error, restart dev server and ensure NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are loaded in the Next.js runtime.',
      },
      { status: 500 }
    )
  }
}

