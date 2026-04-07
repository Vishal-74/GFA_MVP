import { redirect } from 'next/navigation'
import { PublicShell } from '@/components/PublicShell'
import ExaminationsClient from '@/components/ExaminationsClient'
import { createServerSupabase } from '@/lib/supabase-server'
import { userHasAdmission } from '@/lib/gfa-access'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default async function ExaminationsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admitted = await userHasAdmission(supabase, user.id)

  const { data: accessRows } = await supabase.from('lecture_access').select('course_id').eq('user_id', user.id)

  const { data: enrollRows } = await supabase.from('enrollments').select('course_id').eq('user_id', user.id)

  const idSet = new Set<string>()
  for (const r of accessRows || []) {
    if (r.course_id) idSet.add(r.course_id as string)
  }
  for (const r of enrollRows || []) {
    if (r.course_id) idSet.add(r.course_id as string)
  }

  const courses: { id: string; slug: string; title: string }[] = []
  for (const id of idSet) {
    const { data: c } = await supabase.from('courses').select('id, slug, title').eq('id', id).maybeSingle()
    if (c) courses.push(c as { id: string; slug: string; title: string })
  }
  courses.sort((a, b) => a.title.localeCompare(b.title))

  const { data: efpRows, error: efpErr } = await supabase
    .from('exam_fee_purchases')
    .select('course_id, pricing_item_code')
    .eq('user_id', user.id)

  const examFees = efpErr ? [] : efpRows || []

  const paidCourseIds = examFees.filter((r) => r.course_id != null).map((r) => r.course_id as string)
  const finalBachelorPaid = examFees.some((r) => r.pricing_item_code === 'FINAL_EXAM_BACHELOR_EUR')
  const finalMasterPaid = examFees.some((r) => r.pricing_item_code === 'FINAL_EXAM_MASTER_EUR')

  const e = siteCopy.examinations

  return (
    <PublicShell>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-muted">{e.eyebrow}</p>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-normal text-gfa-fg-bright">{e.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-gfa-muted">{e.description}</p>

        <div className="mt-10">
          <ExaminationsClient
            admitted={admitted}
            courses={courses}
            paidCourseIds={paidCourseIds}
            finalBachelorPaid={finalBachelorPaid}
            finalMasterPaid={finalMasterPaid}
          />
        </div>
      </div>
    </PublicShell>
  )
}
