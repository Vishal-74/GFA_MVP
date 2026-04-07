'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

type CourseRow = { id: string; title: string; slug: string }

type RequestRow = {
  id: string
  course_id: string
  level: 'bachelor' | 'master'
  preferred_times_text: string | null
  status: string
  scheduled_at: string | null
  created_at: string
}

export const dynamic = 'force-dynamic'

export default function DashboardExamsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [courseId, setCourseId] = useState<string>('')
  const [level, setLevel] = useState<'bachelor' | 'master'>('bachelor')
  const [preferredTimes, setPreferredTimes] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

        const [{ data: accessRows }, { data: enrollRows }] = await Promise.all([
          supabase.from('lecture_access').select('course_id').eq('user_id', uid),
          supabase.from('enrollments').select('course_id').eq('user_id', uid),
        ])

        const idSet = new Set<string>()
        for (const r of accessRows || []) if (r.course_id) idSet.add(r.course_id as string)
        for (const r of enrollRows || []) if (r.course_id) idSet.add(r.course_id as string)

        const list: CourseRow[] = []
        for (const id of idSet) {
          const { data: c } = await supabase.from('courses').select('id, title, slug').eq('id', id).maybeSingle()
          if (c) list.push(c as CourseRow)
        }
        list.sort((a, b) => a.title.localeCompare(b.title))
        if (cancelled) return
        setCourses(list)
        if (!courseId && list[0]?.id) setCourseId(list[0].id)

        const { data: reqRows, error: reqErr } = await supabase
          .from('exam_schedule_requests')
          .select('id, course_id, level, preferred_times_text, status, scheduled_at, created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })

        if (cancelled) return
        if (reqErr) {
          setRequests([])
        } else {
          setRequests((reqRows || []) as RequestRow[])
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load examination center.')
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

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  async function submitRequest() {
    if (!userId || !courseId) return
    setSubmitting(true)
    setError(null)
    try {
      const { error: insErr } = await supabase.from('exam_schedule_requests').insert({
        user_id: userId,
        course_id: courseId,
        level,
        preferred_times_text: preferredTimes.trim() || null,
      })
      if (insErr) {
        setError(insErr.message)
        return
      }
      setPreferredTimes('')
      const { data: reqRows } = await supabase
        .from('exam_schedule_requests')
        .select('id, course_id, level, preferred_times_text, status, scheduled_at, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setRequests((reqRows || []) as RequestRow[])
    } catch {
      setError('Could not submit scheduling request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-[14px] text-gfa-muted">Loading examination center…</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Examinations</p>
        <h1 className="mt-3 font-display text-3xl font-normal text-gfa-fg-bright">Examination center</h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-gfa-muted">
          Pay certificate fees in{' '}
          <Link href="/examinations" className="text-gfa-accent-bright hover:text-gfa-accent-soft">
            Examinations & fees
          </Link>
          . Then request a slot here. (Video-call exams and instructor confirmation are the next milestone.)
        </p>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-300/90">
          {error}
        </div>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <p className="text-[14px] font-medium text-gfa-fg-bright">Request an examination slot</p>
          {courses.length === 0 ? (
            <p className="mt-3 text-[13px] text-gfa-muted">Enroll or purchase a lecture series to request its examination.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-2 text-[13px] text-gfa-muted">
                <span>Lecture series</span>
                <select
                  className="h-11 w-full rounded-[10px] border border-gfa-border bg-gfa-rose/30 px-4 text-[14px] text-gfa-fg"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-[13px] text-gfa-muted">
                <span>Level</span>
                <select
                  className="h-11 w-full rounded-[10px] border border-gfa-border bg-gfa-rose/30 px-4 text-[14px] text-gfa-fg"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as 'bachelor' | 'master')}
                >
                  <option value="bachelor">Bachelor</option>
                  <option value="master">Master</option>
                </select>
              </label>

              <label className="md:col-span-2 space-y-2 text-[13px] text-gfa-muted">
                <span>Preferred times (timezone, 2–3 options)</span>
                <Input
                  value={preferredTimes}
                  onChange={(e) => setPreferredTimes(e.target.value)}
                  placeholder="e.g., Tue 18:00–20:00 CET, Thu 08:00–10:00 CET"
                />
              </label>

              <div className="md:col-span-2">
                <Button type="button" onClick={submitRequest} disabled={submitting || !courseId} size="pill">
                  {submitting ? 'Submitting…' : 'Request slot'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-[14px] font-medium text-gfa-fg-bright">Your requests</p>
          {requests.length === 0 ? (
            <p className="mt-3 text-[13px] text-gfa-muted">No requests yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {requests.map((r) => {
                const c = courseById.get(r.course_id)
                return (
                  <li key={r.id} className="rounded-[12px] border border-gfa-border bg-gfa-canvas/20 px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-medium text-gfa-fg-bright">{c?.title ?? 'Lecture series'}</p>
                        <p className="mt-1 text-[13px] text-gfa-muted">
                          Level: {r.level === 'master' ? 'Master' : 'Bachelor'} · Status: {r.status}
                        </p>
                        {r.preferred_times_text ? (
                          <p className="mt-2 text-[13px] leading-relaxed text-gfa-muted">{r.preferred_times_text}</p>
                        ) : null}
                      </div>
                      <p className="text-[12px] text-gfa-subtle">
                        {new Date(r.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

