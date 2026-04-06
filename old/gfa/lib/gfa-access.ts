import type { SupabaseClient } from '@supabase/supabase-js'

/** Watch lecture videos: lecture_access, legacy enrollment, or free course after free enroll. */
export async function userCanAccessCourseLearn(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  priceCents: number
): Promise<boolean> {
  const { data: access } = await supabase
    .from('lecture_access')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (access) return true

  const { data: enr } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (enr) return true

  return false
}

export async function userHasAdmission(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('admissions')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  return Boolean(data)
}
