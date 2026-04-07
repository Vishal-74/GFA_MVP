'use client'

import { useState } from 'react'
import Link from 'next/link'
import SimulatedExamCertFeeButton from '@/components/SimulatedExamCertFeeButton'
import SimulatedFinalExamFeeButton from '@/components/SimulatedFinalExamFeeButton'
import SimulatedAdmissionButton from '@/components/SimulatedAdmissionButton'
import { GFA_FEE_SCHEDULE } from '@/lib/gfa-brand'

type CourseRow = { id: string; slug: string; title: string }

export default function ExaminationsClient({
  admitted,
  courses,
  paidCourseIds,
  finalBachelorPaid,
  finalMasterPaid,
}: {
  admitted: boolean
  courses: CourseRow[]
  paidCourseIds: string[]
  finalBachelorPaid: boolean
  finalMasterPaid: boolean
}) {
  const [level, setLevel] = useState<'bachelor' | 'master'>('bachelor')

  if (!admitted) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
        <p className="text-[15px] font-medium text-gfa-fg-bright">Admission required</p>
        <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">
          Examination fees are billed only after the one-time admission fee. Lecture-series access is also required for
          per-series certificate fees.
        </p>
        <div className="mt-6 flex justify-center">
          <SimulatedAdmissionButton />
        </div>
        <Link href="/dashboard" className="mt-4 inline-block text-[13px] text-gfa-accent-bright">
          Dashboard →
        </Link>
      </div>
    )
  }

  const paidSet = new Set(paidCourseIds)

  return (
    <div className="space-y-12">
      <div className="rounded-2xl border border-gfa-border bg-gfa-surface/50 p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gfa-muted">Programme level for new fees</p>
        <p className="mt-2 text-[13px] text-gfa-muted">
          Bachelor: {GFA_FEE_SCHEDULE.examCertBachelorEur}. Master: {GFA_FEE_SCHEDULE.examCertMasterEur}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(['bachelor', 'master'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium capitalize ${
                level === l
                  ? 'border-gfa-accent bg-gfa-accent text-gfa-on-accent'
                  : 'border-gfa-border text-gfa-muted hover:border-gfa-accent/40'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl text-gfa-fg-bright">Certificate examination (per lecture series)</h2>
        <p className="mt-2 text-[14px] text-gfa-muted">
          Pay once per series to sit the assessment for that series. You must already have access to the lecture videos.
        </p>
        <ul className="mt-6 space-y-4">
          {courses.length === 0 ? (
            <li className="text-[14px] text-gfa-subtle">No lecture series access yet — purchase a series or enroll free where offered.</li>
          ) : (
            courses.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl border border-gfa-border bg-gfa-rose/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-gfa-fg-bright">{c.title}</p>
                  <Link href={`/courses/${c.slug}`} className="text-[13px] text-gfa-accent-bright hover:underline">
                    Course page →
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {paidSet.has(c.id) ? (
                    <span className="text-[13px] font-medium text-emerald-600/90 dark:text-emerald-400">Fee paid</span>
                  ) : (
                    <SimulatedExamCertFeeButton courseId={c.id} level={level} />
                  )}
                  <Link
                    href={`/exam/${c.id}`}
                    className="text-[13px] font-medium text-gfa-muted underline-offset-4 hover:text-gfa-fg hover:underline"
                  >
                    Go to exam →
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-gfa-border bg-gfa-canvas/80 p-6">
        <h2 className="font-display text-xl text-gfa-fg-bright">Programme final examination</h2>
        <p className="mt-2 text-[14px] text-gfa-muted">
          {GFA_FEE_SCHEDULE.finalExamBachelorEur}; {GFA_FEE_SCHEDULE.finalExamMasterEur}. Separate from per-series
          assessments; billed once per degree track when you are ready.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider text-gfa-subtle">Bachelor</span>
            {finalBachelorPaid ? (
              <span className="text-[13px] text-emerald-600/90 dark:text-emerald-400">Paid</span>
            ) : (
              <SimulatedFinalExamFeeButton level="bachelor" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider text-gfa-subtle">Master</span>
            {finalMasterPaid ? (
              <span className="text-[13px] text-emerald-600/90 dark:text-emerald-400">Paid</span>
            ) : (
              <SimulatedFinalExamFeeButton level="master" />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
