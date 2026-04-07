import Link from 'next/link'
import { formatMoney } from '@/lib/utils'
import { groupLecturesIntoModules } from '@/lib/lecture-modules'
import { GFA_EXAM_PHILOSOPHY, GFA_FEE_SCHEDULE } from '@/lib/gfa-brand'
import { notFound } from 'next/navigation'
import EnrollButton from '@/components/EnrollButton'
import { PublicShell } from '@/components/PublicShell'
import { createServerSupabase } from '@/lib/supabase-server'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ locked?: string }>
}

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { locked } = await searchParams
  const supabase = await createServerSupabase()
  const cd = siteCopy.courseDetail

  const { data: course } = await supabase.from('courses').select('*, lectures(*)').eq('slug', slug).single()

  if (!course) {
    notFound()
  }

  const { data: admissionPrice } = await supabase
    .from('pricing_items')
    .select('amount_cents, currency')
    .eq('code', 'ADMISSION_USD')
    .maybeSingle()

  let lecturerOfficeSlug: string | null = null
  if (course.lecturer_id) {
    const { data: lec } = await supabase.from('lecturers').select('slug').eq('id', course.lecturer_id).maybeSingle()
    lecturerOfficeSlug = lec?.slug ?? null
  }

  const payCents =
    (course.price_cents as number) === 0
      ? 0
      : (course.lecture_series_price_cents as number | null) ?? (course.price_cents as number)
  const seriesCurrency = (course.lecture_series_currency as string | null) || 'eur'

  const lectures = course.lectures.sort((a: any, b: any) => a.order_index - b.order_index)
  const syllabusModules = groupLecturesIntoModules(lectures)

  const admissionDisplay = admissionPrice
    ? formatMoney(admissionPrice.amount_cents, admissionPrice.currency)
    : GFA_FEE_SCHEDULE.admissionUsd.amount

  return (
    <PublicShell containerClassName="pb-20">
      <div>
        {locked === '1' ? (
          <div className="mb-8 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-4 text-[14px] text-gfa-fg">
            <p className="font-medium text-gfa-fg-bright">{cd.lockedTitle}</p>
            <p className="mt-2 leading-relaxed text-gfa-muted">{cd.lockedBody}</p>
          </div>
        ) : null}

        <div className="grid gap-14 lg:grid-cols-[1fr_320px] lg:gap-12">
          <div className="space-y-10">
            <div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-[13px] text-gfa-muted transition-colors hover:text-gfa-accent"
              >
                {cd.backToCatalog}
              </Link>
              <h1 className="mt-6 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-tight tracking-tight">
                {course.title}
              </h1>
              {course.description && (
                <p className="mt-5 text-[17px] leading-relaxed text-gfa-muted">{course.description}</p>
              )}
            </div>

            {course.lecturer_name && (
              <div className="rounded-2xl border border-gfa-border bg-gfa-surface p-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gfa-accent">{cd.lecturerEyebrow}</p>
                <p className="mt-3 text-lg font-medium text-gfa-fg">{course.lecturer_name}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-gfa-muted">
                  {course.lecturer_bio || cd.lecturerBioFallback}
                </p>
                {lecturerOfficeSlug ? (
                  <Link
                    href={`/instructors/${lecturerOfficeSlug}`}
                    className="mt-5 inline-flex text-[13px] font-medium text-gfa-accent-bright hover:text-gfa-accent-soft"
                  >
                    {cd.visitOfficeCta}
                  </Link>
                ) : null}
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-gfa-subtle">{cd.syllabusLabel}</h3>
              {lectures.length > 0 ? (
                <div className="mt-5 space-y-8">
                  {syllabusModules.map((mod) => (
                    <div key={`${mod.sequence}-${mod.title}`}>
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gfa-accent">
                        Module {mod.sequence} · {mod.title}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {mod.lectures.map((lecture) => {
                          const globalIndex =
                            lectures.findIndex((l: { id: string }) => l.id === lecture.id) + 1
                          return (
                            <li
                              key={lecture.id}
                              className="flex items-center gap-4 rounded-xl border border-gfa-border bg-gfa-rose/30 px-4 py-3"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gfa-border text-[12px] text-gfa-muted">
                                {globalIndex}
                              </span>
                              <span className="text-[15px] text-gfa-fg/90">{lecture.title}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-[14px] text-gfa-muted">{cd.lecturesComingSoon}</p>
              )}
            </div>
          </div>

          <aside className="lg:pt-2">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-gfa-border bg-gfa-rose/50 p-8 backdrop-blur-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gfa-subtle">{cd.asideSeriesEyebrow}</p>
                <p className="mt-2 font-display text-3xl text-gfa-accent">
                  {payCents === 0 ? 'Free' : formatMoney(payCents, seriesCurrency)}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-gfa-muted">{cd.getSeriesPricingBlurb()}</p>
              </div>

              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                courseTitle={course.title}
                priceCents={payCents}
              />

              <div className="rounded-xl border border-gfa-border bg-gfa-canvas/40 p-4 text-[12px] leading-relaxed text-gfa-muted">
                <p className="font-medium text-gfa-fg/90">{cd.admissionEyebrow}</p>
                <p className="mt-2">
                  {admissionDisplay}
                  {cd.getAdmissionUnlockSuffix()}
                </p>
                <Link href="/dashboard" className="mt-3 inline-block text-gfa-accent-bright hover:text-gfa-accent-soft">
                  {cd.admissionDashboardCta}
                </Link>
              </div>

              <div className="rounded-xl border border-gfa-border bg-gfa-canvas/40 p-4 text-[12px] leading-relaxed text-gfa-muted">
                <p className="font-medium text-gfa-fg/90">{cd.examFeesEyebrow}</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>{GFA_FEE_SCHEDULE.examCertBachelorEur}</li>
                  <li>{GFA_FEE_SCHEDULE.examCertMasterEur}</li>
                  <li>{GFA_FEE_SCHEDULE.finalExamBachelorEur}</li>
                  <li>{GFA_FEE_SCHEDULE.finalExamMasterEur}</li>
                </ul>
              </div>

              <ul className="space-y-3 border-t border-gfa-border pt-6 text-[13px] text-gfa-muted">
                <li className="flex gap-3">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gfa-accent/80" />
                  {cd.getVideoCountBullet(lectures.length)}
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gfa-accent/80" />
                  {cd.aiSupportBullet}
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gfa-accent/80" />
                  {GFA_EXAM_PHILOSOPHY}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  )
}
