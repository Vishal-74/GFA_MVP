import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Layers, Sparkles } from 'lucide-react'
import { catalogEmoji, catalogGradientClass, formatPrice } from '@/lib/utils'
import {
  divideTotalUnevenlyAcrossCourses,
  fetchLessonCountsByCourse,
  sumLessonCounts,
} from '@/lib/courses-catalog'
import { getSupabaseUrlHost } from '@/lib/supabase-env'
import { Course } from '@/lib/supabase'
import { PublicShell } from '@/components/PublicShell'
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server'
import { PageHeader } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

function StatCard({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <Card className="gfa-muted-shadow border-gfa-border/90">
      <CardContent className="flex gap-4 pt-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gfa-border/80 bg-gfa-rose/40 text-gfa-accent-bright">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gfa-subtle">{label}</p>
          <div className="mt-1">{children}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function CoursesPage() {
  const supabase = await createServerSupabase()
  const service = createServiceSupabase()
  const c = siteCopy.courses

  const { data: courses, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })

  const list = (courses as Course[] | null) ?? []
  const count = list.length
  const courseIds = list.map((x) => x.id)

  const { map: lessonCountByCourse, error: lectureCountError } = await fetchLessonCountsByCourse(
    courseIds,
    supabase,
    service
  )

  const totalLessons = sumLessonCounts(lessonCountByCourse)
  const displayLessonByCourse = divideTotalUnevenlyAcrossCourses(totalLessons, courseIds)
  const host = getSupabaseUrlHost()
  const statusLabel = count === 0 ? c.statusSoon : c.statusOpen

  return (
    <PublicShell>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader eyebrow={c.catalogEyebrow} title={c.title} description={c.description} />
          <Link
            href="/programs"
            className="shrink-0 text-[13px] font-medium text-gfa-muted transition-colors hover:text-gfa-accent-bright sm:pb-1"
          >
            {c.programsLink} <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatCard icon={Layers} label={c.statsSeries}>
            <p className="font-display text-2xl text-gfa-fg-bright tabular-nums">{count}</p>
          </StatCard>
          <StatCard icon={BookOpen} label={c.statsLessons}>
            <p className="font-display text-2xl text-gfa-fg-bright tabular-nums">{totalLessons}</p>
          </StatCard>
          <StatCard icon={Sparkles} label={c.statsStatus}>
            <p className="font-display text-2xl text-gfa-accent-bright">{statusLabel}</p>
          </StatCard>
        </div>
      </div>

      <section className="mt-12 border-t border-gfa-border/60 pt-10" aria-labelledby="courses-series-heading">
        {count === 0 ? (
          <EmptyState title={c.emptyNoCourses} body={c.emptyHint} actionLabel={c.emptyCta} actionHref="/programs" />
        ) : (
          <>
            <div className="mb-6">
              <h2 id="courses-series-heading" className="font-display text-lg text-gfa-fg-bright sm:text-xl">
                {c.seriesSectionTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-gfa-muted">{c.seriesSectionSubtitle}</p>
            </div>
            <ul className="flex w-full list-none flex-col gap-3 p-0">
              {list.map((course) => {
                const lectureCount = displayLessonByCourse.get(course.id) ?? 0
                const emoji = catalogEmoji(course.catalog_emoji)
                const grad = catalogGradientClass(course.slug)
                const label = `${course.title}. ${lectureCount} ${lectureCount === 1 ? 'lesson' : 'lessons'}. ${formatPrice(course.price_cents)}.`
                return (
                  <li key={course.id}>
                    <Link
                      href={`/courses/${course.slug}`}
                      aria-label={label}
                      className="group block rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfa-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-gfa-canvas"
                    >
                      <Card className="overflow-hidden transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:border-gfa-accent/45 hover:bg-gfa-rose/45 hover:shadow-[0_16px_48px_-24px_rgba(96,165,250,0.45)]">
                        <CardContent className="flex flex-col p-0 sm:flex-row sm:items-stretch">
                          <div
                            className={`relative flex min-h-[92px] w-full shrink-0 items-center justify-center overflow-hidden transition-[filter,box-shadow] duration-300 ease-out group-hover:brightness-110 group-hover:saturate-125 group-hover:shadow-[inset_0_0_24px_rgba(147,197,253,0.15)] sm:w-40 sm:min-h-[104px] md:w-44 ${grad}`}
                          >
                            <div
                              className="absolute inset-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                              style={{
                                background:
                                  'radial-gradient(ellipse 80% 70% at 50% 20%, rgba(96, 165, 250, 0.16), transparent 60%)',
                              }}
                            />
                            <div
                              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              style={{
                                background:
                                  'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255, 255, 255, 0.14), transparent 55%)',
                              }}
                            />
                            <span className="relative select-none text-4xl drop-shadow-sm transition-[filter,transform] duration-300 group-hover:brightness-110 sm:text-5xl" aria-hidden>
                              {emoji}
                            </span>
                            <span className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5">
                              <Badge variant="default" className="text-[10px] sm:text-[11px]">
                                {lectureCount} {lectureCount === 1 ? 'lesson' : 'lessons'}
                              </Badge>
                            </span>
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col gap-3 border-t border-gfa-border p-4 transition-[background-color] duration-300 ease-out group-hover:bg-white/[0.03] sm:flex-row sm:items-center sm:gap-6 sm:border-l sm:border-t-0 sm:py-3 sm:pl-5 sm:pr-6">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gfa-subtle transition-colors duration-300 group-hover:text-gfa-muted">
                                {c.lectureSeriesLabel}
                              </p>
                              <h3 className="mt-0.5 font-display text-[15px] font-medium leading-snug text-gfa-fg-bright transition-colors duration-300 group-hover:text-gfa-accent-bright sm:text-[16px]">
                                {course.title}
                              </h3>
                              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-gfa-muted transition-colors duration-300 group-hover:text-gfa-fg/85">
                                {course.description || c.cardDescriptionFallback}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gfa-subtle">
                                {course.lecturer_name ? (
                                  <span className="transition-colors duration-300 group-hover:text-gfa-muted">With {course.lecturer_name}</span>
                                ) : null}
                                {course.estimated_hours != null && course.estimated_hours > 0 ? (
                                  <span className="rounded-md border border-gfa-border/60 bg-gfa-canvas/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gfa-muted">
                                    {c.hoursLabel(course.estimated_hours)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-gfa-border pt-3 sm:flex-col sm:items-end sm:border-0 sm:border-l sm:border-gfa-border sm:pl-6 sm:pt-0">
                              <span className="font-display text-[15px] font-medium leading-none text-gfa-accent transition-colors duration-300 group-hover:text-gfa-accent-bright sm:text-[16px]">
                                {formatPrice(course.price_cents)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gfa-muted transition-colors duration-300 group-hover:text-gfa-accent-soft">
                                {c.viewCta}
                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {error || lectureCountError ? (
          <p className="mt-6 text-[13px] text-red-300/90">
            Query error: {error?.message ?? lectureCountError?.message}{' '}
            {host ? <span className="text-gfa-subtle">({host})</span> : null}
          </p>
        ) : null}
      </section>
    </PublicShell>
  )
}
