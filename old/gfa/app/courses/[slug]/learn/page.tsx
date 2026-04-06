import { notFound, redirect } from 'next/navigation'
import LearnClient from '@/components/LearnClient'
import { createServerSupabase } from '@/lib/supabase-server'
import { userCanAccessCourseLearn } from '@/lib/gfa-access'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lecture?: string }>
}

export default async function LearnPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { lecture } = await searchParams
  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: course } = await supabase
    .from('courses')
    .select('*, lectures(*)')
    .eq('slug', slug)
    .single()

  if (!course) {
    notFound()
  }

  const canLearn = await userCanAccessCourseLearn(
    supabase,
    user.id,
    course.id as string,
    (course.price_cents as number) ?? 0
  )

  if (!canLearn) {
    redirect(`/courses/${slug}?locked=1`)
  }

  return <LearnClient params={{ slug }} courseData={course} initialLectureId={lecture ?? null} />
}
