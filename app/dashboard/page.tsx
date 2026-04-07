'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SimulatedAdmissionButton from '@/components/SimulatedAdmissionButton'
import { catalogEmoji, catalogGradientClass } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type EnrolledCourse = {
  id: string
  course_id: string
  enrolled_at: string
  courses: {
    id: string
    slug: string
    title: string
    description: string
    lecturer_name: string
    catalog_emoji?: string | null
    estimated_hours?: number | null
  }
}

type LectureRow = {
  id: string
  course_id: string
  title: string
  order_index: number
  content_kind: string
}

type CatalogCourse = {
  id: string
  slug: string
  title: string
  description: string | null
  catalog_emoji: string | null
  estimated_hours: number | null
}

const SKILL_PILLS = [
  'Critical thinking',
  'Philosophy',
  'Economics',
  'Governance',
  'AI literacy',
  'Sovereignty',
  'Ethics',
  'Writing',
]

const REC_FILTER_LABELS = ['All', 'Philosophy', 'Economics', 'Technology', 'Science', 'Business'] as const

function ProgressRing({ pct, size = 112 }: { pct: number; size?: number }) {
  const uid = useId()
  const gradId = `ring-grad-${uid.replace(/:/g, '')}`
  const r = 42
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, pct))
  const offset = c - (clamped / 100) * c
  const vb = 100

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${vb} ${vb}`}
        className="-rotate-90 text-gfa-fg/15"
        aria-hidden
      >
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[clamp(1.1rem,2.8vw,1.35rem)] font-bold tabular-nums text-gfa-fg-bright">
        {clamped}%
      </span>
    </div>
  )
}

function WeekStrip() {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const js = new Date().getDay()
  const idx = js === 0 ? 6 : js - 1

  return (
    <div className="flex justify-between gap-1 pt-3">
      {days.map((d, i) => (
        <div
          key={d}
          className={`flex min-h-9 min-w-0 flex-1 items-center justify-center rounded-lg text-[11px] font-semibold sm:text-xs ${
            i === idx
              ? 'bg-gfa-accent text-gfa-on-accent shadow-lg shadow-black/40'
              : 'bg-gfa-fg/5 text-gfa-muted'
          }`}
        >
          {d}
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([])
  const [progressByCourse, setProgressByCourse] = useState<Record<string, number>>({})
  const [completedLectureIds, setCompletedLectureIds] = useState<Set<string>>(new Set())
  const [totalMinutesLearned, setTotalMinutesLearned] = useState(0)
  const [lecturesByCourse, setLecturesByCourse] = useState<Map<string, LectureRow[]>>(new Map())
  const [catalogCourses, setCatalogCourses] = useState<CatalogCourse[]>([])
  const [hasAdmission, setHasAdmission] = useState(false)
  const [admissionLoaded, setAdmissionLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [recFilter, setRecFilter] = useState<string>('All')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoadError(null)
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()
        if (cancelled) return

        if (authError || !user) {
          router.replace('/login')
          return
        }

        setUser(user)

        const [{ data: enrollmentsData, error: enrollError }, { data: catalogData }, { data: admRow, error: admErr }] =
          await Promise.all([
            supabase
              .from('enrollments')
              .select('*, courses(*)')
              .eq('user_id', user.id)
              .order('enrolled_at', { ascending: false }),
            supabase
              .from('courses')
              .select('id, slug, title, description, catalog_emoji, estimated_hours')
              .order('title', { ascending: true })
              .limit(24),
            supabase.from('admissions').select('user_id').eq('user_id', user.id).maybeSingle(),
          ])

        if (cancelled) return

        if (!admErr) {
          setHasAdmission(Boolean(admRow))
        } else {
          setHasAdmission(false)
        }
        setAdmissionLoaded(true)

        if (enrollError) {
          setLoadError(enrollError.message)
          setEnrollments([])
          setProgressByCourse({})
          return
        }

        const { data: accessRows, error: accessErr } = await supabase
          .from('lecture_access')
          .select('id, course_id, created_at, courses(*)')
          .eq('user_id', user.id)

        if (cancelled) return

        const base = enrollmentsData || []
        const enrolledIds = new Set(base.map((e) => e.course_id))
        const extras: EnrolledCourse[] = []
        if (!accessErr && accessRows) {
          for (const row of accessRows as {
            id: string
            course_id: string
            created_at: string
            courses: EnrolledCourse['courses'] | EnrolledCourse['courses'][] | null
          }[]) {
            const raw = row.courses
            const courseObj = Array.isArray(raw) ? raw[0] : raw
            if (courseObj && !enrolledIds.has(row.course_id)) {
              extras.push({
                id: row.id,
                course_id: row.course_id,
                enrolled_at: row.created_at,
                courses: courseObj,
              })
            }
          }
        }

        const list = [...base, ...extras]
        setEnrollments(list)
        setCatalogCourses((catalogData || []) as CatalogCourse[])

        const courseIds = list.map((e) => e.course_id)
        if (courseIds.length === 0) {
          setProgressByCourse({})
          setCompletedLectureIds(new Set())
          setTotalMinutesLearned(0)
          setLecturesByCourse(new Map())
        } else {
          const [{ data: lectureRows }, { data: progressRows }] = await Promise.all([
            supabase
              .from('lectures')
              .select('id, course_id, title, order_index, content_kind')
              .in('course_id', courseIds)
              .order('order_index', { ascending: true }),
            supabase.from('progress').select('lecture_id, completed, watched_seconds').eq('user_id', user.id),
          ])

          const byCourse = new Map<string, LectureRow[]>()
          lectureRows?.forEach((row) => {
            const arr = byCourse.get(row.course_id) ?? []
            arr.push(row as LectureRow)
            byCourse.set(row.course_id, arr)
          })
          byCourse.forEach((arr, k) => {
            arr.sort((a, b) => a.order_index - b.order_index)
            byCourse.set(k, arr)
          })
          setLecturesByCourse(byCourse)

          const completed = new Set(
            progressRows?.filter((p) => p.completed).map((p) => p.lecture_id) ?? []
          )
          setCompletedLectureIds(completed)

          let minutes = 0
          progressRows?.forEach((p) => {
            minutes += (p.watched_seconds ?? 0) / 60
          })
          setTotalMinutesLearned(Math.round(minutes))

          const pct: Record<string, number> = {}
          for (const cid of courseIds) {
            const lids = byCourse.get(cid) ?? []
            if (lids.length === 0) {
              pct[cid] = 0
              continue
            }
            const done = lids.filter((l) => completed.has(l.id)).length
            pct[cid] = Math.round((done / lids.length) * 100)
          }
          setProgressByCourse(pct)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not load your account. Check your network and Supabase configuration.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [router])

  const firstName = useMemo(() => {
    const full = user?.user_metadata?.full_name?.trim()
    if (full) return full.split(/\s+/)[0] || 'Learner'
    const email = user?.email as string | undefined
    if (email) return email.split('@')[0] || 'Learner'
    return 'Learner'
  }, [user])

  const featuredEnrollment = useMemo(() => {
    if (enrollments.length === 0) return null
    // Defensive: some rows can have a null `courses` join; ignore those for featured content.
    const valid = enrollments.filter((e) => Boolean(e.courses && (e.courses as any).slug))
    if (valid.length === 0) return null
    const incomplete = valid.find((e) => (progressByCourse[e.course_id] ?? 0) < 100)
    return incomplete ?? valid[0]
  }, [enrollments, progressByCourse])

  const nextLecture = useMemo(() => {
    if (!featuredEnrollment) return null
    const lecs = lecturesByCourse.get(featuredEnrollment.course_id) ?? []
    return lecs.find((l) => !completedLectureIds.has(l.id)) ?? null
  }, [featuredEnrollment, lecturesByCourse, completedLectureIds])

  const totalLessonsRemaining = useMemo(() => {
    let n = 0
    enrollments.forEach((e) => {
      const lecs = lecturesByCourse.get(e.course_id) ?? []
      n += lecs.filter((l) => !completedLectureIds.has(l.id)).length
    })
    return n
  }, [enrollments, lecturesByCourse, completedLectureIds])

  const totalLessonsDone = useMemo(() => completedLectureIds.size, [completedLectureIds])

  const enrolledIds = useMemo(() => new Set(enrollments.map((e) => e.course_id)), [enrollments])

  const recommendations = useMemo(() => {
    const pool = catalogCourses.filter((c) => !enrolledIds.has(c.id))
    if (recFilter === 'All') return pool
    const q = recFilter.toLowerCase()
    return pool.filter((c) => c.title.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q))
  }, [catalogCourses, enrolledIds, recFilter])

  const goalSubtitle = useMemo(() => {
    if (enrollments.length === 0) {
      return 'Choose a lecture series to begin — video lessons, transcripts, and AI support. Progress counts toward Bachelor’s or Master’s programme completion when mapped in Programmes.'
    }
    if (totalLessonsRemaining === 0) {
      return 'Outstanding — every enrolled lesson is complete. Explore new courses or revisit material.'
    }
    return `You have ${enrollments.length} active course${enrollments.length === 1 ? '' : 's'} · ${totalLessonsRemaining} lesson${totalLessonsRemaining === 1 ? '' : 's'} left to complete.`
  }, [enrollments.length, totalLessonsRemaining])

  const todayGoalsDone = useMemo(() => {
    let n = 0
    if (totalLessonsDone > 0) n++
    if ((progressByCourse[featuredEnrollment?.course_id ?? ''] ?? 0) > 0) n++
    if (enrollments.length > 0) n++
    return Math.min(3, n)
  }, [totalLessonsDone, progressByCourse, featuredEnrollment, enrollments.length])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gfa-canvas">
        <p className="text-[15px] tracking-wide text-gfa-subtle">Loading your dashboard…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gfa-canvas">
        <p className="text-[15px] text-gfa-subtle">Redirecting…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center pt-16 text-center">
        <p className="text-[15px] text-gfa-muted">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full border border-gfa-border px-6 py-2.5 text-sm text-gfa-fg transition-colors hover:bg-gfa-rose"
        >
          Retry
        </button>
      </div>
    )
  }

  const featuredPct = featuredEnrollment ? (progressByCourse[featuredEnrollment.course_id] ?? 0) : 0
  const featuredSlug = featuredEnrollment?.courses?.slug
  const learnHref = featuredSlug ? `/courses/${featuredSlug}/learn` : '/courses'
  const nextHref =
    featuredSlug && nextLecture
      ? `/courses/${featuredSlug}/learn?lecture=${nextLecture.id}`
      : learnHref

  const nextKind =
    nextLecture?.content_kind === 'mcq_quiz' ? 'Quiz' : nextLecture ? 'Video' : 'Lesson'

  return (
    <div className="w-full">
      {/* Hero — full-width, brand-tinted dark band */}
      <section className="relative overflow-hidden rounded-[16px] border border-gfa-border bg-gradient-to-b from-gfa-hero-from via-gfa-hero-via to-gfa-hero-to px-6 py-10 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(217, 119, 6, 0.08), transparent)',
          }}
        />
        <div className="relative z-10">
          {admissionLoaded && hasAdmission ? (
            <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 text-[13px] text-emerald-100/95">
              <span className="font-semibold text-emerald-50">Admission active</span>
              <span className="text-emerald-100/80">
                Examinations, library, messenger, and office hours are unlocked per academy policy.
              </span>
            </div>
          ) : null}
          {admissionLoaded && !hasAdmission ? (
            <div className="mb-8 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-5 sm:px-6">
              <p className="text-[15px] font-semibold text-gfa-fg-bright">One-time admission (enrollment) fee</p>
              <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-gfa-muted">
                After payment you can access instructor offices and participate in all features and examination
                procedures. Education is a valuable asset — appropriate remuneration attracts outstanding instructors.
                Lecture series are purchased separately (€200 per series in the published schedule).
              </p>
              <div className="mt-4">
                <SimulatedAdmissionButton />
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(1.85rem,5.5vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-gfa-fg-bright">
                Welcome, {firstName}
              </h1>
              <p className="mt-3 max-w-3xl text-[clamp(0.95rem,2.4vw,1.2rem)] leading-relaxed text-gfa-muted">
                {goalSubtitle}
              </p>
            </div>
            <Link
              href="/courses"
              className="flex h-12 w-full shrink-0 items-center gap-3 rounded-full border border-gfa-fg/15 bg-gfa-deep/50 px-5 text-[14px] text-gfa-muted backdrop-blur-md transition-colors hover:border-gfa-accent/40 hover:bg-gfa-deep/70 sm:max-w-md lg:max-w-sm"
            >
              <svg className="h-5 w-5 shrink-0 text-gfa-accent-soft/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="truncate">Search and browse all courses</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-stretch">
            {/* Primary course card */}
            <div className="lg:col-span-8">
              {featuredEnrollment ? (
                <div className="flex min-h-[min(320px,42vh)] flex-col rounded-2xl border border-gfa-fg/10 bg-gfa-rose/90 p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] backdrop-blur-sm sm:p-8 lg:flex-row lg:gap-10">
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start lg:flex-col lg:items-center">
                    <ProgressRing pct={featuredPct} size={128} />
                    <div className="min-w-0 flex-1 text-center sm:text-left lg:text-center lg:text-left">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gfa-subtle">Continue learning</p>
                      <h2 className="mt-3 font-display text-[clamp(1.25rem,3.2vw,1.85rem)] font-medium leading-snug text-gfa-fg-bright">
                        {featuredEnrollment.courses?.title ?? 'Your lecture series'}
                      </h2>
                      {featuredEnrollment.courses?.lecturer_name ? (
                        <p className="mt-2 text-[14px] text-gfa-muted">
                          With {featuredEnrollment.courses.lecturer_name}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-8 flex min-w-0 flex-1 flex-col justify-between border-t border-gfa-fg/10 pt-8 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gfa-subtle">Up next</p>
                      {nextLecture ? (
                        <>
                          <p className="mt-3 text-[clamp(1rem,2.5vw,1.2rem)] font-semibold leading-snug text-gfa-fg-bright">
                            {nextLecture.title}
                          </p>
                          <p className="mt-2 text-[13px] text-gfa-accent-soft/85">
                            {nextKind} · continue where you left off
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-[15px] text-gfa-muted">
                          All lessons complete — take the final exam or browse more courses.
                        </p>
                      )}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        href={learnHref}
                        className="inline-flex items-center justify-center rounded-lg bg-gfa-accent px-6 py-3 text-[14px] font-semibold text-gfa-on-accent transition-colors hover:bg-gfa-accent-bright"
                      >
                        Resume learning
                      </Link>
                      {nextLecture ? (
                        <Link
                          href={nextHref}
                          className="inline-flex items-center justify-center rounded-lg border border-gfa-fg/20 px-5 py-3 text-[14px] font-medium text-gfa-fg-bright transition-colors hover:bg-gfa-fg/5"
                        >
                          Jump to next item
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[min(280px,38vh)] flex-col justify-center rounded-2xl border border-gfa-fg/10 bg-gfa-rose/90 p-8 text-center backdrop-blur-sm sm:p-10">
                  <h2 className="font-display text-[clamp(1.4rem,4vw,2rem)] text-gfa-fg-bright">Start your first course</h2>
                  <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-gfa-muted">
                    Enrol in minutes. Lessons, transcripts, AI coach, and exams — all in one place.
                  </p>
                  <Link
                    href="/courses"
                    className="mx-auto mt-8 inline-flex rounded-lg bg-gfa-accent px-8 py-3 text-[14px] font-semibold text-gfa-on-accent transition-colors hover:bg-gfa-accent-bright"
                  >
                    Browse catalogue
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar widgets */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              <div className="rounded-2xl border border-gfa-fg/10 bg-gfa-deep/60 p-5 backdrop-blur-sm sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gfa-subtle">Today&apos;s goals</p>
                <ul className="mt-4 space-y-3 text-[14px] leading-snug text-gfa-fg">
                  <li className="flex gap-3">
                    <span className="text-gfa-accent-bright" aria-hidden>
                      ★
                    </span>
                    <span>Complete any 3 learning milestones · {todayGoalsDone}/3</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gfa-accent-bright" aria-hidden>
                      ★
                    </span>
                    <span>Resume your primary course · {featuredPct}% overall</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gfa-accent-bright" aria-hidden>
                      ★
                    </span>
                    <span>Lessons finished · {totalLessonsDone}</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gfa-fg/10 bg-gfa-deep/60 p-5 backdrop-blur-sm sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gfa-subtle">Weekly activity</p>
                <p className="mt-2 text-[13px] text-gfa-muted">Your learning rhythm this week</p>
                <WeekStrip />
                <p className="mt-4 text-[clamp(0.95rem,2.2vw,1.05rem)] font-medium text-gfa-fg-bright">
                  {totalLessonsDone} item{totalLessonsDone === 1 ? '' : 's'} completed · {totalMinutesLearned} min in
                  lessons
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills strip */}
      <section className="border-t border-gfa-border bg-gradient-to-b from-gfa-rose/95 to-gfa-deep py-10 sm:py-12">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[clamp(1.1rem,2.8vw,1.35rem)] font-semibold text-gfa-fg-bright">
              Select skills you&apos;d like to develop
            </h2>
            <div className="flex flex-wrap gap-4 text-[13px]">
              <span className="text-gfa-accent-soft/90">Tap a theme · explore matching courses</span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            {SKILL_PILLS.map((skill) => (
              <Link
                key={skill}
                href="/courses"
                className="rounded-full border border-gfa-border bg-gfa-rose/80 px-4 py-2.5 text-[13px] font-medium text-gfa-fg transition-colors hover:border-gfa-accent/50 hover:bg-gfa-elevated"
              >
                {skill}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enrolled + recommendations */}
      <section className="border-t border-gfa-border bg-gfa-deep py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-[clamp(1.25rem,3.2vw,1.75rem)] font-bold text-gfa-fg-bright">Your courses</h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-gfa-muted">
                Everything you&apos;re enrolled in — open any course to continue.
              </p>
            </div>
            <Link href="/courses" className="shrink-0 text-[14px] font-medium text-gfa-accent-bright hover:text-gfa-accent-soft">
              Catalogue →
            </Link>
          </div>

          {enrollments.length === 0 ? null : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {enrollments.map((enrollment) => {
                if (!enrollment.courses?.slug) return null
                const pct = progressByCourse[enrollment.course_id] ?? 0
                return (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${enrollment.courses.slug}/learn`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gfa-border bg-gfa-canvas/90 transition-[border-color,box-shadow] hover:border-gfa-accent/35 hover:shadow-[0_20px_60px_-28px_rgba(217,119,6,0.2)]"
                  >
                    <div
                      className={`relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br ${catalogGradientClass(enrollment.courses.slug)}`}
                    >
                      <span className="relative text-5xl sm:text-6xl" aria-hidden>
                        {catalogEmoji(enrollment.courses.catalog_emoji)}
                      </span>
                      <span className="absolute bottom-3 left-4 rounded-md bg-gfa-deep/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gfa-muted">
                        {pct}% complete
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-[clamp(1rem,2.2vw,1.15rem)] leading-snug text-gfa-fg-bright group-hover:text-gfa-accent-soft">
                        {enrollment.courses.title}
                      </h3>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gfa-elevated">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gfa-accent to-gfa-accent-bright transition-[width] duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="mt-4 text-[13px] font-medium text-gfa-accent-bright">Continue →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-16 border-t border-gfa-border pt-14">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-[clamp(1.25rem,3.2vw,1.75rem)] font-bold text-gfa-fg-bright">
                  Recommended for you
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] text-gfa-muted">
                  Courses you haven&apos;t enrolled in yet — filtered by topic.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {REC_FILTER_LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setRecFilter(label)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                    recFilter === label
                      ? 'bg-gfa-accent text-gfa-on-accent'
                      : 'border border-gfa-border bg-gfa-rose/60 text-gfa-fg hover:border-gfa-border-strong'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative mt-8">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {recommendations.length === 0 ? (
                  <p className="snap-start py-8 text-[15px] text-gfa-subtle">
                    {recFilter === 'All'
                      ? 'You’re enrolled in everything we’re showing, or the catalogue is empty.'
                      : 'No courses match this filter — try All.'}
                  </p>
                ) : (
                  recommendations.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.slug}`}
                      className="w-[min(100%,280px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-gfa-border bg-gfa-canvas transition-[border-color,transform] hover:border-gfa-accent/40 hover:-translate-y-0.5 sm:w-[300px]"
                    >
                      <div
                        className={`flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${catalogGradientClass(c.slug)}`}
                      >
                        <span className="text-5xl" aria-hidden>
                          {catalogEmoji(c.catalog_emoji)}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-[15px] font-semibold leading-snug text-gfa-fg-bright line-clamp-2">{c.title}</h3>
                        {c.estimated_hours != null ? (
                          <p className="mt-2 text-[12px] text-gfa-subtle">~{c.estimated_hours}h estimated</p>
                        ) : null}
                        <span className="mt-3 inline-block text-[13px] font-medium text-gfa-accent-bright">View course →</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gfa-border bg-gfa-canvas py-8 text-center text-[12px] text-gfa-subtle">
        Global Freedom Academy · Dashboard
      </footer>
    </div>
  )
}
