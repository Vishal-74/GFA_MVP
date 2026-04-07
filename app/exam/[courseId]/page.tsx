'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import CertificateGenerator from '@/components/CertificateGenerator'
import Navigation from '@/components/Navigation'
import SimulatedAdmissionButton from '@/components/SimulatedAdmissionButton'
import SimulatedExamCertFeeButton from '@/components/SimulatedExamCertFeeButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ courseId: string }> }

export default function ExamPage({ params }: PageProps) {
  const { courseId } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [exam, setExam] = useState<any>(null)
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [examPhase, setExamPhase] = useState<'guidelines' | 'active'>('guidelines')
  const [guidelinesAcknowledged, setGuidelinesAcknowledged] = useState(false)
  const [admissionGate, setAdmissionGate] = useState<'loading' | 'ok' | 'blocked'>('loading')
  const [examCertGate, setExamCertGate] = useState<'loading' | 'ok' | 'blocked' | 'na'>('loading')
  const [certLevel, setCertLevel] = useState<'bachelor' | 'master'>('bachelor')

  const questions = [
    'What are the key concepts covered in this course?',
    'How would you apply the principles learned to a real-world scenario?',
    'Explain the most challenging topic from this course in your own words.',
    'What insights did you gain that changed your perspective?',
    'How do you plan to use this knowledge going forward?',
  ]

  useEffect(() => {
    let cancelled = false

    async function loadExam() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (cancelled) return

        if (authError || !user) {
          router.replace('/login')
          return
        }

        setUser(user)

        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle()

        if (cancelled) return

        setCourse(courseData)

        const { data: admissionRow, error: admissionError } = await supabase
          .from('admissions')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (cancelled) return

        if (admissionError) {
          setAdmissionGate('ok')
        } else {
          setAdmissionGate(admissionRow ? 'ok' : 'blocked')
        }

        const admittedOk = Boolean(admissionError || admissionRow)
        if (admittedOk) {
          const { data: certRow, error: certErr } = await supabase
            .from('exam_fee_purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle()

          if (cancelled) return

          if (certErr) {
            setExamCertGate('ok')
          } else {
            setExamCertGate(certRow ? 'ok' : 'blocked')
          }
        } else if (!cancelled) {
          setExamCertGate('na')
        }

        const { data: existingExam } = await supabase
          .from('exams')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .order('submitted_at', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle()

        if (cancelled) return

        setExam(existingExam)
      } catch {
        if (!cancelled) router.replace('/dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadExam()
    return () => {
      cancelled = true
    }
  }, [courseId, router])

  async function handleSubmit() {
    if (!user || !course || admissionGate !== 'ok' || examCertGate !== 'ok') return

    if (answers.some((a) => a.trim().length < 50)) {
      alert('Please provide substantial answers (at least 50 characters each)')
      return
    }

    setSubmitting(true)

    const submissionText = questions
      .map((q, i) => `Q${i + 1}: ${q}\n\nA${i + 1}: ${answers[i]}`)
      .join('\n\n---\n\n')

    const blob = new Blob([submissionText], { type: 'text/plain' })
    const objectName = `exam_${course.id}_${Date.now()}.txt`
    const storagePath = `${user.id}/${objectName}`

    const { error: uploadError } = await supabase.storage
      .from('exam-submissions')
      .upload(storagePath, blob)

    if (uploadError) {
      alert('Failed to submit exam. Please try again.')
      setSubmitting(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('exam-submissions')
      .getPublicUrl(storagePath)

    const { data: latestExam } = await supabase
      .from('exams')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    const submittedAt = new Date().toISOString()
    let writeError = null

    if (latestExam?.status === 'failed') {
      const { error } = await supabase
        .from('exams')
        .update({
          status: 'submitted',
          submission_url: publicUrl,
          submitted_at: submittedAt,
          feedback: null,
          reviewed_at: null,
        })
        .eq('id', latestExam.id)
      writeError = error
    } else {
      const { error } = await supabase.from('exams').insert({
        user_id: user.id,
        course_id: course.id,
        status: 'submitted',
        submission_url: publicUrl,
        submitted_at: submittedAt,
      })
      writeError = error
    }

    if (writeError) {
      alert('Failed to record submission. Please try again.')
      setSubmitting(false)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await fetch('/api/notify-exam-submitted', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ courseId: course.id }),
        })
      }
    } catch {
      /* email is best-effort */
    }

    router.push('/dashboard')
  }

  const textareaClass =
    'min-h-[140px] w-full resize-y rounded-xl border border-gfa-border bg-gfa-surface px-4 py-3 text-[15px] text-gfa-fg placeholder:text-gfa-subtle transition-[border-color,box-shadow] focus:border-gfa-accent/40 focus:outline-none focus:ring-1 focus:ring-gfa-accent/20'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gfa-canvas">
        <p className="text-[13px] text-gfa-muted">Loading exam…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gfa-canvas">
        <p className="text-[13px] text-gfa-muted">Redirecting…</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
        <Navigation />
        <main className="mx-auto max-w-md px-6 pt-32 text-center">
          <p className="text-[15px] text-gfa-muted">This course was not found.</p>
        </main>
      </div>
    )
  }

  if (admissionGate === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gfa-canvas">
        <p className="text-[13px] text-gfa-muted">Checking admission…</p>
      </div>
    )
  }

  if (admissionGate === 'blocked') {
    return (
      <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
        <Navigation />
        <main className="mx-auto max-w-lg px-6 pb-24 pt-24 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gfa-muted">Examinations</p>
          <h1 className="mt-4 font-display text-3xl font-normal text-gfa-fg-bright">Admission required</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gfa-muted">
            Per academy policy, the one-time admission fee unlocks all examination procedures, the digital library,
            campus messenger, and office hours. Lecture-series access alone is not sufficient for exams.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <SimulatedAdmissionButton
              onSuccess={async () => {
                setAdmissionGate('ok')
                const { data: u2 } = await supabase.auth.getUser()
                const uid = u2.user?.id
                if (!uid) return
                const { data: certRow, error: certErr } = await supabase
                  .from('exam_fee_purchases')
                  .select('id')
                  .eq('user_id', uid)
                  .eq('course_id', courseId)
                  .maybeSingle()
                if (certErr) {
                  setExamCertGate('ok')
                } else {
                  setExamCertGate(certRow ? 'ok' : 'blocked')
                }
              }}
            />
            <Link
              href="/dashboard"
              className="text-[14px] font-medium text-gfa-accent-bright hover:text-gfa-accent-soft"
            >
              Back to dashboard
            </Link>
            <Link
              href={`/courses/${course.slug}`}
              className="text-[13px] text-gfa-muted underline-offset-4 hover:text-gfa-fg hover:underline"
            >
              Course overview
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (admissionGate === 'ok' && examCertGate === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gfa-canvas">
        <p className="text-[13px] text-gfa-muted">Checking examination fee…</p>
      </div>
    )
  }

  if (admissionGate === 'ok' && examCertGate === 'blocked') {
    return (
      <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
        <Navigation />
        <main className="mx-auto max-w-lg px-6 pb-24 pt-24 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gfa-muted">Examinations</p>
          <h1 className="mt-4 font-display text-3xl font-normal text-gfa-fg-bright">Certificate examination fee</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gfa-muted">
            Per the fee schedule, a separate payment applies for each lecture-series certificate (€25 Bachelor / €35
            Master). Pay here (simulated) to unlock this series assessment, or use the Examinations page.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {(['bachelor', 'master'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setCertLevel(l)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize ${
                  certLevel === l
                    ? 'border-gfa-accent bg-gfa-accent text-gfa-on-accent'
                    : 'border-gfa-border text-gfa-muted'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-4">
            <SimulatedExamCertFeeButton
              courseId={courseId}
              level={certLevel}
              onSuccess={() => setExamCertGate('ok')}
            />
            <Link href="/examinations" className="text-[14px] font-medium text-gfa-accent-bright hover:underline">
              All examination fees →
            </Link>
            <Link
              href={`/courses/${course.slug}`}
              className="text-[13px] text-gfa-muted underline-offset-4 hover:text-gfa-fg hover:underline"
            >
              Course overview
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (exam?.status === 'passed') {
    return (
      <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
        <Navigation />

        <main className="mx-auto max-w-xl px-6 pb-20 pt-24 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-gfa-accent/30 bg-gfa-accent-muted">
            <svg className="h-8 w-8 text-gfa-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-normal">Passed</h1>
          <p className="mt-4 text-[15px] text-gfa-muted">
            You completed <span className="text-gfa-fg/90">{course?.title}</span>.
          </p>
          {exam.feedback && (
            <div className="mt-10 rounded-2xl border border-gfa-border bg-gfa-surface p-6 text-left">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gfa-accent">Feedback</p>
              <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">{exam.feedback}</p>
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <CertificateGenerator
              studentName={user?.user_metadata?.full_name || user?.email}
              courseName={course?.title}
              lecturerName={course?.lecturer_name || 'GFA Faculty'}
            />
          </div>
        </main>
      </div>
    )
  }

  if (exam?.status === 'submitted') {
    return (
      <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
        <Navigation />

        <main className="mx-auto max-w-xl px-6 pb-20 pt-24 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-gfa-border bg-gfa-surface">
            <svg className="h-7 w-7 text-gfa-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-normal">Under review</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gfa-muted">
            Your answers for {course?.title} are with the faculty. We will notify you when there is a result.
          </p>
          <p className="mt-6 text-[12px] text-gfa-subtle">
            Submitted{' '}
            {new Date(exam.submitted_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </main>
      </div>
    )
  }

  if (exam?.status === 'failed') {
    return (
      <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
        <Navigation />

        <main className="mx-auto max-w-xl px-6 pb-20 pt-24 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5">
            <svg className="h-7 w-7 text-red-400/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-normal">Not yet</h1>
          <p className="mt-4 text-[15px] text-gfa-muted">
            This submission did not meet the bar. Read the feedback and try again when you are ready.
          </p>
          {exam.feedback && (
            <div className="mt-10 rounded-2xl border border-gfa-border bg-gfa-surface p-6 text-left">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gfa-accent">Feedback</p>
              <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">{exam.feedback}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setExam(null)
              setExamPhase('guidelines')
              setGuidelinesAcknowledged(false)
            }}
            className="mt-10 rounded-full bg-gfa-accent px-8 py-3 text-sm font-medium text-gfa-on-accent transition-colors hover:bg-gfa-accent-bright"
          >
            Retake exam
          </button>
        </main>
      </div>
    )
  }

  if (examPhase === 'guidelines') {
    return (
      <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
        <Navigation />

        <main className="mx-auto max-w-2xl px-6 pb-24 pt-24">
          <header className="mb-10 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gfa-muted">Assessment</p>
            <h1 className="mt-3 font-display text-3xl font-normal md:text-4xl">Lecture series examination</h1>
            <p className="mt-3 text-[15px] text-gfa-muted">{course?.title}</p>
          </header>

          <div className="rounded-2xl border border-gfa-border bg-gfa-surface p-8 md:p-10">
            <h2 className="font-display text-lg text-gfa-fg">Before you begin</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-gfa-muted">
              Read the guidelines below. The academy&apos;s full programme emphasises oral, project-based, and
              presentation assessments (Ch. 14); this interface provides a structured written practice submission
              reviewed by faculty.
            </p>

            <ul className="mt-8 space-y-4 text-[14px] leading-relaxed text-gfa-fg/90">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gfa-accent" />
                <span>
                  <strong className="font-medium text-gfa-fg">Five written questions.</strong> Each answer must be at
                  least 50 characters. Aim for clear reasoning and concrete examples from the course.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gfa-accent" />
                <span>
                  <strong className="font-medium text-gfa-fg">Human review.</strong> Submissions are read by faculty;
                  typical turnaround is within 48 hours. You will be notified by email.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gfa-accent" />
                <span>
                  <strong className="font-medium text-gfa-fg">Academic honesty.</strong> Use your own words. You may
                  refer to your notes and the course materials; do not copy paste from others or AI without attribution
                  where required by your institution.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gfa-accent" />
                <span>
                  <strong className="font-medium text-gfa-fg">One attempt per submission window.</strong> If you do not
                  pass, you may retake after reading the feedback.
                </span>
              </li>
            </ul>

            <label className="mt-10 flex cursor-pointer items-start gap-3 rounded-xl border border-gfa-border bg-gfa-canvas/50 px-4 py-3">
              <input
                type="checkbox"
                checked={guidelinesAcknowledged}
                onChange={(e) => setGuidelinesAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gfa-border text-gfa-accent focus:ring-gfa-accent/30"
              />
              <span className="text-[13px] leading-relaxed text-gfa-muted">
                I have read the guidelines and I am ready to start the exam. I understand my answers will be stored and
                reviewed.
              </span>
            </label>

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={!guidelinesAcknowledged}
                onClick={() => setExamPhase('active')}
                className="rounded-full bg-gfa-accent px-10 py-3.5 text-sm font-medium tracking-wide text-gfa-on-accent transition-colors hover:bg-gfa-accent-bright disabled:cursor-not-allowed disabled:opacity-40"
              >
                Begin exam
              </button>
              <p className="text-center text-[12px] text-gfa-subtle">You can leave this page; return here when ready.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
      <Navigation />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-24">
        <header className="mb-12 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gfa-muted">Assessment</p>
          <h1 className="mt-3 font-display text-3xl font-normal md:text-4xl">Lecture series examination</h1>
          <p className="mt-3 text-[15px] text-gfa-muted">{course?.title}</p>
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-gfa-accent/25 bg-gfa-accent-muted px-5 py-4">
            <p className="text-[13px] leading-relaxed text-gfa-fg/85">
              Take your time. Thoughtful, complete answers are reviewed by a human grader. Programme final examinations
              are separate and billed on the Examinations page.
            </p>
          </div>
        </header>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gfa-border bg-gfa-surface p-6 md:p-8"
            >
              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gfa-accent text-[12px] font-semibold text-gfa-on-accent">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-4">
                  <h3 className="text-[15px] font-medium leading-snug text-gfa-fg">{question}</h3>
                  <textarea
                    className={textareaClass}
                    placeholder="Your answer (minimum 50 characters)"
                    value={answers[index]}
                    onChange={(e) => {
                      const next = [...answers]
                      next[index] = e.target.value
                      setAnswers(next)
                    }}
                  />
                  <p className="text-[11px] text-gfa-subtle">{answers[index].length} characters</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || answers.some((a) => a.trim().length < 50)}
            className="rounded-full bg-gfa-accent px-12 py-3.5 text-sm font-medium tracking-wide text-gfa-on-accent transition-colors hover:bg-gfa-accent-bright disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Submitting…' : 'Submit exam'}
          </button>
          <p className="max-w-md text-center text-[12px] text-gfa-subtle">
            Typical review within 48 hours. You will hear by email.
          </p>
        </div>
      </main>
    </div>
  )
}
