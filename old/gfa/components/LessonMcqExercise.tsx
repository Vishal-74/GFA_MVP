'use client'

import type { McqPayload } from '@/lib/mcq'
import { useState } from 'react'

export default function LessonMcqExercise({
  title,
  payload,
  onComplete,
}: {
  title: string
  payload: McqPayload
  onComplete: () => void
}) {
  const [choices, setChoices] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const total = payload.questions.length
  const computedScore = payload.questions.reduce(
    (acc, q, i) => acc + (choices[i] === q.correctIndex ? 1 : 0),
    0
  )
  const allAnswered = payload.questions.every((_, i) => choices[i] !== undefined)

  function handleSubmit() {
    const s = payload.questions.reduce(
      (acc, q, i) => acc + (choices[i] === q.correctIndex ? 1 : 0),
      0
    )
    setSubmitted(true)
    if (s === total) onComplete()
  }

  return (
    <div className="border-b border-gfa-border px-6 py-6 md:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gfa-accent">Chapter exercise</p>
        <h2 className="mt-2 font-display text-xl font-normal md:text-2xl">{title}</h2>
        <p className="mt-2 text-[14px] text-gfa-muted">
          Five multiple-choice questions. Submit to see your score. Get all five right to mark this exercise complete
          (use Retry if needed).
        </p>

        <div className="mt-8 space-y-8">
          {payload.questions.map((q, qi) => (
            <div key={qi} className="rounded-2xl border border-gfa-border bg-gfa-surface p-5 md:p-6">
              <p className="text-[15px] font-medium leading-snug text-gfa-fg">
                <span className="text-gfa-accent">{qi + 1}.</span> {q.prompt}
              </p>
              <ul className="mt-4 space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = choices[qi] === oi
                  const correct = oi === q.correctIndex
                  return (
                    <li key={oi}>
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() => setChoices((c) => ({ ...c, [qi]: oi }))}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-[14px] transition-colors ${
                          submitted && correct
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-gfa-fg'
                            : submitted && selected && !correct
                              ? 'border-red-500/40 bg-red-500/5 text-gfa-fg'
                              : selected
                                ? 'border-gfa-accent/50 bg-gfa-accent-muted text-gfa-fg'
                                : 'border-gfa-border text-gfa-muted hover:border-gfa-accent/30 hover:bg-gfa-canvas/50'
                        }`}
                      >
                        {opt}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          {!submitted ? (
            <button
              type="button"
              disabled={!allAnswered}
              onClick={handleSubmit}
              className="rounded-full bg-gfa-accent px-10 py-3 text-sm font-medium text-gfa-on-accent transition-colors hover:bg-gfa-accent-bright disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit answers
            </button>
          ) : (
            <div className="w-full rounded-2xl border border-gfa-border bg-gfa-rose/30 px-6 py-5 text-center">
              <p className="font-display text-2xl text-gfa-accent">
                {computedScore} / {total}
              </p>
              <p className="mt-2 text-[14px] text-gfa-muted">
                {computedScore === total
                  ? 'Perfect — this exercise is marked complete.'
                  : 'Review the highlighted answers and try again.'}
              </p>
              {computedScore < total && (
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setChoices({})
                  }}
                  className="mt-4 rounded-full border border-gfa-border px-6 py-2.5 text-[13px] text-gfa-fg transition-colors hover:bg-gfa-surface"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
