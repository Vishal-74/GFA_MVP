'use client'

import MuxPlayer from '@mux/mux-player-react'
import AiBot, { COACH_PROMPTS } from '@/components/AiBot'
import LessonMcqExercise from '@/components/LessonMcqExercise'
import { parseMcq } from '@/lib/mcq'
import { resolveMuxPlaybackId } from '@/lib/mux-playback'
import { groupLecturesIntoModules, type LectureRow } from '@/lib/lecture-modules'
import type { CourseChatContext } from '@/lib/ai-bot-static'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LearnTab = 'transcript' | 'notes' | 'coach'

function LearnLessonTabs({
  active,
  onTabChange,
  isVideoLesson,
  transcript,
  setCoachPrompt,
}: {
  active: LearnTab
  onTabChange: (t: LearnTab) => void
  isVideoLesson: boolean
  transcript: string | null | undefined
  setCoachPrompt: (value: string | null) => void
}) {
  const tabBtn = (id: LearnTab, label: string) => (
    <button
      type="button"
      onClick={() => onTabChange(id)}
      className={`border-b-2 pb-3 text-[15px] font-medium transition-colors sm:text-[16px] ${
        active === id
          ? 'border-gfa-accent text-gfa-fg-bright'
          : 'border-transparent text-gfa-subtle hover:text-gfa-fg'
      }`}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className="mt-10 border-b border-gfa-border">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {tabBtn('transcript', 'Transcript')}
          {tabBtn('notes', 'Notes')}
          {tabBtn('coach', 'Coach')}
        </div>
      </div>

      <div className="py-8">
        {active === 'transcript' &&
          (isVideoLesson && transcript ? (
            <div className="max-w-3xl rounded-2xl border border-gfa-border bg-gfa-rose/30 p-6 sm:p-8">
              <p className="text-[17px] leading-[1.7] text-gfa-fg sm:text-[18px] md:text-[19px]">{transcript}</p>
            </div>
          ) : (
            <p className="text-[16px] text-gfa-subtle">
              {isVideoLesson
                ? 'No transcript for this lesson.'
                : 'Transcript is available on video lessons.'}
            </p>
          ))}

        {active === 'notes' && (
          <div className="max-w-xl rounded-2xl border border-gfa-border bg-gfa-rose/40 p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gfa-border bg-gfa-elevated/80"
                aria-hidden
              >
                <svg className="h-7 w-7 text-gfa-accent/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-medium text-gfa-fg sm:text-xl">Lesson notes</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gfa-muted sm:text-[16px]">
                  A downloadable PDF companion for this lesson (key ideas, references, and exercises) will be
                  available soon.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gfa-border bg-gfa-elevated/50 px-5 py-3 text-[14px] font-medium text-gfa-subtle cursor-not-allowed"
                  title="Coming soon"
                >
                  <svg className="h-4 w-4 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download notes (soon)
                </button>
              </div>
            </div>
          </div>
        )}

        {active === 'coach' && (
          <div className="rounded-2xl border border-gfa-border bg-gfa-rose/50 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gfa-subtle">Coach</p>
            <p className="mt-3 text-[16px] leading-relaxed text-gfa-fg sm:text-[17px]">
              Let me know if you have any questions about this material. I&apos;m here to help!
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {COACH_PROMPTS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setCoachPrompt(label)
                    onTabChange('coach')
                    requestAnimationFrame(() =>
                      document.getElementById('ai-tutor')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    )
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-gfa-border-strong bg-gfa-elevated/80 px-4 py-2.5 text-left text-[14px] leading-snug text-gfa-fg transition-colors hover:border-gfa-accent/50 hover:bg-gfa-elevated sm:text-[15px]"
                >
                  <span className="text-gfa-accent-bright" aria-hidden>
                    ✦
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function LearnClient({
  params,
  courseData,
  initialLectureId = null,
}: {
  params: { slug: string }
  courseData: any
  initialLectureId?: string | null
}) {
  const router = useRouter()
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completedLectureIds, setCompletedLectureIds] = useState<Set<string>>(new Set())
  const [muxPlaybackFailed, setMuxPlaybackFailed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [coachPrompt, setCoachPrompt] = useState<string | null>(null)
  const [learnTab, setLearnTab] = useState<LearnTab>('transcript')
  const autoCompleteThresholdRef = useRef<Set<string>>(new Set())
  const lectures = courseData.lectures.sort((a: any, b: any) => a.order_index - b.order_index) as LectureRow[]
  const modules = useMemo(() => groupLecturesIntoModules(lectures), [lectures])
  const lectureIdToIndex = useMemo(
    () => new Map(lectures.map((l, i) => [l.id, i])),
    [lectures]
  )
  const courseChatContext: CourseChatContext = useMemo(
    () => ({
      title: courseData.title,
      description: courseData.description,
      lecturer_name: courseData.lecturer_name,
      estimated_hours: courseData.estimated_hours ?? undefined,
      modules,
    }),
    [courseData, modules]
  )
  const currentLecture = lectures[currentLectureIndex]
  const currentMcq = currentLecture ? parseMcq(currentLecture.mcq) : null
  const isMcqLesson = Boolean(currentMcq)
  const isVideoLesson = Boolean(currentLecture && !isMcqLesson)
  const completedCount = completedLectureIds.size
  const progressPercent =
    lectures.length > 0 ? Math.round((completedCount / lectures.length) * 100) : 0

  const consumeCoachPrompt = useCallback(() => setCoachPrompt(null), [])

  useEffect(() => {
    setMuxPlaybackFailed(false)
  }, [currentLectureIndex, currentLecture?.id])

  useEffect(() => {
    autoCompleteThresholdRef.current.clear()
  }, [currentLecture?.id])

  useEffect(() => {
    setLearnTab('transcript')
  }, [currentLecture?.id])

  useEffect(() => {
    const lid = initialLectureId?.trim()
    if (!lid) return
    const idx = lectureIdToIndex.get(lid)
    if (idx !== undefined) setCurrentLectureIndex(idx)
  }, [initialLectureId, lectureIdToIndex])

  const refreshProgress = useCallback(
    async (userId: string) => {
      const ids = lectures.map((l: { id: string }) => l.id)
      if (ids.length === 0) return
      const { data } = await supabase
        .from('progress')
        .select('lecture_id, completed')
        .eq('user_id', userId)
        .in('lecture_id', ids)
      const next = new Set<string>()
      data?.forEach((row) => {
        if (row.completed) next.add(row.lecture_id)
      })
      setCompletedLectureIds(next)
    },
    [lectures]
  )

  const markLectureCompleted = useCallback(
    async (lectureId: string, watchedSecondsHint?: number) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: existing } = await supabase
        .from('progress')
        .select('watched_seconds')
        .eq('user_id', user.id)
        .eq('lecture_id', lectureId)
        .maybeSingle()

      const prevSec = existing?.watched_seconds ?? 0
      const watched_seconds = Math.max(prevSec, watchedSecondsHint ?? 0)

      const { error } = await supabase.from('progress').upsert(
        {
          user_id: user.id,
          lecture_id: lectureId,
          completed: true,
          watched_seconds,
        },
        { onConflict: 'user_id,lecture_id' }
      )

      if (!error) {
        setCompletedLectureIds((prev) => new Set(prev).add(lectureId))
      }
    },
    []
  )

  const maybeAutoCompleteNearEnd = useCallback(
    (lectureId: string, el: Pick<HTMLVideoElement, 'duration' | 'currentTime'>) => {
      const dur = el.duration
      const t = el.currentTime
      if (!dur || !Number.isFinite(dur) || dur <= 0) return
      if (t / dur < 0.92) return
      if (autoCompleteThresholdRef.current.has(lectureId)) return
      autoCompleteThresholdRef.current.add(lectureId)
      void markLectureCompleted(lectureId, Math.floor(t))
    },
    [markLectureCompleted]
  )

  const goNext = useCallback(() => {
    setCurrentLectureIndex((i) => Math.min(lectures.length - 1, i + 1))
  }, [lectures.length])

  const goPrev = useCallback(() => {
    setCurrentLectureIndex((i) => Math.max(0, i - 1))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (cancelled) return

        if (authError || !user) {
          router.replace('/login')
          return
        }

        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .maybeSingle()

        if (cancelled) return

        if (!enrollment) {
          router.replace(`/courses/${params.slug}`)
          return
        }

        setIsEnrolled(true)
        await refreshProgress(user.id)
      } catch {
        if (!cancelled) router.replace(`/courses/${params.slug}`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    checkAuth()
    return () => {
      cancelled = true
    }
  }, [courseData.id, params.slug, router, refreshProgress])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gfa-canvas text-gfa-muted">
        <p className="text-[15px] tracking-wide">Loading course…</p>
      </div>
    )
  }

  if (!isEnrolled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gfa-canvas text-gfa-muted">
        <p className="text-[15px]">Redirecting…</p>
      </div>
    )
  }

  const isQuiz = (lec: LectureRow) => Boolean(lec.content_kind === 'mcq_quiz' || lec.mcq)

  return (
    <div className="flex h-[100dvh] flex-col bg-gfa-canvas text-gfa-fg">
      {/* Top bar — progress + course context (Coursera-style) */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gfa-border bg-gfa-canvas px-3 sm:px-5">
        <button
          type="button"
          aria-label={sidebarOpen ? 'Hide course outline' : 'Show course outline'}
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gfa-border text-gfa-fg transition-colors hover:bg-gfa-elevated"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link
          href="/dashboard"
          className="hidden shrink-0 text-[13px] text-gfa-subtle transition-colors hover:text-gfa-accent-bright sm:inline"
        >
          Dashboard
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[13px] font-medium text-gfa-fg sm:text-[15px]">{courseData.title}</p>
          <p className="text-[11px] text-gfa-subtle sm:text-xs">
            {completedCount} / {lectures.length} items completed
          </p>
        </div>
        <div className="hidden w-40 shrink-0 sm:block md:w-56">
          <div className="h-1.5 overflow-hidden rounded-full bg-gfa-elevated">
            <div
              className="h-full rounded-full bg-gfa-accent/90 transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Outline sidebar */}
        <aside
          className={`flex shrink-0 flex-col border-r border-gfa-border bg-gfa-rose/90 transition-[width,opacity] duration-200 ease-out ${
            sidebarOpen ? 'w-[min(100%,380px)] opacity-100' : 'w-0 overflow-hidden border-0 opacity-0'
          }`}
        >
          <div className="border-b border-gfa-border p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-[17px] font-medium leading-snug text-gfa-accent-bright/95 sm:text-lg">
                {courseData.title}
              </h2>
              <button
                type="button"
                aria-label="Close outline"
                onClick={() => setSidebarOpen(false)}
                className="shrink-0 rounded p-1 text-gfa-subtle hover:bg-gfa-elevated hover:text-gfa-fg"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[12px] text-gfa-subtle">
              {modules.length} module{modules.length === 1 ? '' : 's'} · {lectures.length} items
            </p>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-3">
            {modules.map((mod) => (
              <div key={`${mod.sequence}-${mod.title}`}>
                <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gfa-subtle">
                  {mod.title}
                </p>
                <div className="space-y-0.5">
                  {mod.lectures.map((lecture) => {
                    const index = lectureIdToIndex.get(lecture.id) ?? 0
                    const done = completedLectureIds.has(lecture.id)
                    const active = index === currentLectureIndex
                    return (
                      <button
                        key={lecture.id}
                        type="button"
                        onClick={() => {
                          setCurrentLectureIndex(index)
                          setSidebarOpen(false)
                        }}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          active
                            ? 'border-l-2 border-gfa-accent bg-gfa-elevated/90 pl-[10px]'
                            : 'border-l-2 border-transparent hover:bg-gfa-elevated/50'
                        }`}
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                          {done ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                              ✓
                            </span>
                          ) : isQuiz(lecture) ? (
                            <span className="text-[12px] text-gfa-accent/90">?</span>
                          ) : (
                            <span className="text-[11px] text-gfa-subtle">▶</span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] leading-snug text-gfa-fg sm:text-[16px]">
                            {lecture.title}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-gfa-subtle">
                            {isQuiz(lecture) ? 'Practice quiz' : 'Video'}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href={`/exam/${courseData.id}`}
                className="block rounded-xl border border-gfa-accent/35 bg-gfa-accent-muted py-2.5 text-center text-[13px] font-medium text-gfa-accent-bright transition-colors hover:bg-gfa-accent-muted"
              >
                Final exam
              </Link>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <main className="flex min-w-0 flex-1 flex-col bg-gfa-canvas">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {currentLecture && isMcqLesson && currentMcq && (
              <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 lg:px-12">
                <h1 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] font-semibold leading-tight tracking-tight text-gfa-fg-bright">
                  {currentLecture.title}
                </h1>
                <div className="mt-6 rounded-2xl border border-gfa-border bg-gfa-rose/40 p-5">
                  <p className="text-[15px] leading-relaxed text-gfa-muted">
                    Answer all questions correctly to mark this exercise complete.
                  </p>
                </div>
                <div className="mt-8">
                  <LessonMcqExercise
                    title={currentLecture.title}
                    payload={currentMcq}
                    onComplete={() => void markLectureCompleted(currentLecture.id)}
                  />
                </div>
                <LearnLessonTabs
                  active={learnTab}
                  onTabChange={setLearnTab}
                  isVideoLesson={false}
                  transcript={currentLecture.transcript}
                  setCoachPrompt={setCoachPrompt}
                />
                <div className={learnTab !== 'coach' ? 'hidden' : 'mt-8'}>
                  <AiBot
                    courseId={courseData.id}
                    courseContext={courseChatContext}
                    pendingAutoSend={coachPrompt}
                    onPendingAutoSendConsumed={consumeCoachPrompt}
                    variant="inline"
                  />
                </div>
              </div>
            )}

            {currentLecture && isVideoLesson && (
              <div className="w-full">
                <div className="w-full bg-gfa-deep">
                  <div className="mx-auto w-full max-w-[1600px]">
                    <div className="aspect-video max-h-[min(72vh,900px)] w-full min-h-[200px] sm:min-h-[280px]">
                      {muxPlaybackFailed ? (
                        <div className="flex h-full w-full flex-col bg-gfa-rose">
                          <video
                            key={currentLecture.id}
                            className="h-full w-full object-contain"
                            controls
                            playsInline
                            preload="metadata"
                            src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                            onTimeUpdate={(e) =>
                              maybeAutoCompleteNearEnd(currentLecture.id, e.currentTarget)
                            }
                            onEnded={(e) => {
                              void markLectureCompleted(
                                currentLecture.id,
                                Math.floor(e.currentTarget.duration || 0)
                              )
                            }}
                          />
                          <p className="border-t border-gfa-border px-3 py-2 text-center text-[12px] text-gfa-subtle">
                            Demo fallback — set a valid Mux playback ID if the stream failed.
                          </p>
                        </div>
                      ) : (
                        <MuxPlayer
                          key={`${currentLecture.id}-${resolveMuxPlaybackId(currentLecture.mux_asset_id)}`}
                          streamType="on-demand"
                          playbackId={resolveMuxPlaybackId(currentLecture.mux_asset_id ?? '')}
                          className="h-full w-full"
                          onTimeUpdate={(e) => {
                            const t = e.currentTarget as unknown as HTMLVideoElement
                            maybeAutoCompleteNearEnd(currentLecture.id, t)
                          }}
                          onEnded={(e) => {
                            const t = e.currentTarget as unknown as HTMLVideoElement
                            void markLectureCompleted(
                              currentLecture.id,
                              Math.floor(t.duration || t.currentTime || 0)
                            )
                          }}
                          onError={() => setMuxPlaybackFailed(true)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 lg:px-12">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <h1 className="font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-semibold leading-[1.15] tracking-tight text-gfa-fg-bright">
                        {currentLecture.title}
                      </h1>
                      {completedLectureIds.has(currentLecture.id) ? (
                        <p className="mt-3 text-[15px] font-medium text-emerald-400">Completed</p>
                      ) : (
                        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-gfa-muted sm:text-[16px]">
                          Completes automatically at ~92% watched or at the end. You can also mark complete from
                          the link on the right.
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 sm:flex-row sm:items-center">
                      {!completedLectureIds.has(currentLecture.id) && (
                        <button
                          type="button"
                          onClick={() => void markLectureCompleted(currentLecture.id)}
                          className="text-[15px] font-medium text-gfa-accent-bright underline-offset-4 hover:underline"
                        >
                          Mark complete
                        </button>
                      )}
                    </div>
                  </div>

                  <LearnLessonTabs
                    active={learnTab}
                    onTabChange={setLearnTab}
                    isVideoLesson
                    transcript={currentLecture.transcript}
                    setCoachPrompt={setCoachPrompt}
                  />
                  <div className={learnTab !== 'coach' ? 'hidden' : 'mt-8'}>
                    <AiBot
                      courseId={courseData.id}
                      courseContext={courseChatContext}
                      pendingAutoSend={coachPrompt}
                      onPendingAutoSendConsumed={consumeCoachPrompt}
                      variant="inline"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-gfa-border bg-gfa-canvas/95 px-4 py-3 backdrop-blur sm:px-8">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentLectureIndex === 0}
              className="rounded-lg border border-gfa-border px-4 py-2.5 text-[14px] text-gfa-fg transition-colors hover:bg-gfa-elevated disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>
            <span className="hidden text-[13px] text-gfa-subtle sm:inline">Global Freedom Academy</span>
            <button
              type="button"
              onClick={goNext}
              disabled={currentLectureIndex >= lectures.length - 1}
              className="rounded-lg border-2 border-gfa-accent/60 bg-gfa-accent-muted px-5 py-2.5 text-[14px] font-semibold text-gfa-accent-bright transition-colors hover:bg-gfa-accent-muted disabled:cursor-not-allowed disabled:opacity-30"
            >
              Go to next item →
            </button>
          </footer>
        </main>
      </div>
    </div>
  )
}
