'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Program = {
  id: string
  slug: string
  title: string
  kind: 'bachelor' | 'master' | 'mba'
  lecture_series_count: number | null
}

type ProgramCourse = {
  sequence_order: number
  course_id: string
  courses: { id: string; slug: string; title: string } | null
}

type ProgressRow = { lecture_id: string; completed: boolean }
type LectureRow = { id: string; course_id: string }

export const dynamic = 'force-dynamic'

export default function LearningPathPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgramSlug, setSelectedProgramSlug] = useState<string>('bachelor')
  const [programCourses, setProgramCourses] = useState<ProgramCourse[]>([])
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setLoading(true)
      try {
        const { data: auth } = await supabase.auth.getUser()
        const uid = auth.user?.id ?? null
        if (!uid) {
          window.location.href = '/login'
          return
        }
        if (cancelled) return
        setUserId(uid)

        const { data: progRows } = await supabase
          .from('programs')
          .select('id, slug, title, kind, lecture_series_count')
          .in('slug', ['bachelor', 'master'])
          .order('kind', { ascending: true })

        const list = (progRows || []) as Program[]
        if (cancelled) return
        setPrograms(list)
        if (!list.some((p) => p.slug === selectedProgramSlug) && list[0]?.slug) {
          setSelectedProgramSlug(list[0].slug)
        }

        // Determine which course_ids are "completed" by this user.
        // We treat a course as completed when ALL its lectures are marked completed in progress.
        const { data: lectureRows } = await supabase.from('lectures').select('id, course_id')
        const { data: progressRows } = await supabase
          .from('progress')
          .select('lecture_id, completed')
          .eq('user_id', uid)

        const lectures = (lectureRows || []) as LectureRow[]
        const progress = (progressRows || []) as ProgressRow[]

        const completedLectureIds = new Set(progress.filter((p) => p.completed).map((p) => p.lecture_id))
        const lectureIdsByCourse = new Map<string, string[]>()
        for (const l of lectures) {
          const arr = lectureIdsByCourse.get(l.course_id) || []
          arr.push(l.id)
          lectureIdsByCourse.set(l.course_id, arr)
        }
        const completedCourses = new Set<string>()
        for (const [courseId, lectureIds] of lectureIdsByCourse.entries()) {
          if (lectureIds.length > 0 && lectureIds.every((id) => completedLectureIds.has(id))) {
            completedCourses.add(courseId)
          }
        }
        if (cancelled) return
        setCompletedCourseIds(completedCourses)
      } catch {
        setError('Failed to load learning path.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadProgram() {
      const p = programs.find((x) => x.slug === selectedProgramSlug)
      if (!p) return
      const { data: pcRows } = await supabase
        .from('program_courses')
        .select('sequence_order, course_id, courses(id, slug, title)')
        .eq('program_id', p.id)
        .order('sequence_order', { ascending: true })
      if (cancelled) return
      setProgramCourses((pcRows || []) as ProgramCourse[])
    }
    loadProgram()
    return () => {
      cancelled = true
    }
  }, [programs, selectedProgramSlug])

  const selectedProgram = programs.find((p) => p.slug === selectedProgramSlug) || null
  const totalRequired = selectedProgram?.lecture_series_count || programCourses.length || 0
  const completedRequired = useMemo(() => {
    let n = 0
    for (const pc of programCourses) if (completedCourseIds.has(pc.course_id)) n++
    return n
  }, [programCourses, completedCourseIds])

  const nextCourse = useMemo(() => {
    for (const pc of programCourses) {
      if (!completedCourseIds.has(pc.course_id)) return pc
    }
    return null
  }, [programCourses, completedCourseIds])

  if (loading) return <p className="text-[14px] text-gfa-muted">Loading learning path…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Programme</p>
          <h1 className="mt-3 font-display text-3xl font-normal text-gfa-fg-bright">My learning path</h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-gfa-muted">
            A clear curriculum map with progress toward degree completion. (Curriculum tree UX will be expanded; this
            is the MVP foundation.)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={selectedProgramSlug === 'bachelor' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedProgramSlug('bachelor')}
          >
            Bachelor
          </Button>
          <Button
            type="button"
            variant={selectedProgramSlug === 'master' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedProgramSlug('master')}
          >
            Master
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-300/90">
          {error}
        </div>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[14px] font-medium text-gfa-fg-bright">{selectedProgram?.title || 'Programme'}</p>
              <p className="mt-1 text-[13px] text-gfa-muted">
                Progress: <span className="tabular-nums text-gfa-fg-bright">{completedRequired}</span> of{' '}
                <span className="tabular-nums text-gfa-fg-bright">{totalRequired}</span> lecture series completed
              </p>
            </div>
            {nextCourse?.courses ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={`/courses/${nextCourse.courses.slug}`}>Next: {nextCourse.courses.title}</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-[14px] font-medium text-gfa-fg-bright">Curriculum</p>
          <ol className="mt-4 grid gap-2">
            {programCourses.map((pc) => {
              const done = completedCourseIds.has(pc.course_id)
              const title = pc.courses?.title || 'Lecture series'
              const slug = pc.courses?.slug
              return (
                <li
                  key={pc.course_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-gfa-border bg-gfa-canvas/20 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                        done ? 'bg-emerald-500/15 text-emerald-200' : 'bg-gfa-fg/5 text-gfa-muted'
                      }`}
                      aria-hidden
                    >
                      {pc.sequence_order}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-gfa-fg-bright">{title}</p>
                      <p className="text-[12px] text-gfa-muted">{done ? 'Completed' : 'In progress / next'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {slug ? (
                      <Button asChild size="sm" variant={done ? 'secondary' : 'primary'}>
                        <Link href={`/courses/${slug}`}>{done ? 'Review' : 'Open'}</Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

