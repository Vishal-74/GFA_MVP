'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PRICES = {
  admissionUsd: 250,
  lectureSeriesEur: 200,
  examCertBachelorEur: 25,
  examCertMasterEur: 35,
  finalBachelorEur: 100,
  finalMasterEur: 200,
} as const

export default function PricingCalculator() {
  const [programme, setProgramme] = useState<'bachelor' | 'master'>('bachelor')
  const [includeAdmission, setIncludeAdmission] = useState(true)

  const breakdown = useMemo(() => {
    const seriesCount = programme === 'bachelor' ? 8 : 6
    const certFee = programme === 'bachelor' ? PRICES.examCertBachelorEur : PRICES.examCertMasterEur
    const finalFee = programme === 'bachelor' ? PRICES.finalBachelorEur : PRICES.finalMasterEur

    return {
      seriesCount,
      courseFeesEur: seriesCount * PRICES.lectureSeriesEur,
      certFeesEur: seriesCount * certFee,
      finalFeeEur: finalFee,
      totalEur: seriesCount * PRICES.lectureSeriesEur + seriesCount * certFee + finalFee,
      admissionUsd: includeAdmission ? PRICES.admissionUsd : 0,
    }
  }, [programme, includeAdmission])

  const row = (label: string, value: string, subtle?: boolean) => (
    <div className={cn('flex items-start justify-between gap-4 py-2 text-[14px]', subtle ? 'text-gfa-muted' : 'text-gfa-fg')}>
      <span className="text-left">{label}</span>
      <span className={cn('shrink-0 tabular-nums', subtle ? 'text-gfa-muted' : 'text-gfa-fg-bright')}>{value}</span>
    </div>
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-gfa-fg-bright">Total cost calculator</p>
            <p className="mt-1 text-[13px] leading-relaxed text-gfa-muted">
              Modular fees: lecture series + per-series certificate + programme final exam. Admission is one-time.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={programme === 'bachelor' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setProgramme('bachelor')}
            >
              Bachelor
            </Button>
            <Button
              type="button"
              variant={programme === 'master' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setProgramme('master')}
            >
              Master
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-[12px] border border-gfa-border bg-gfa-canvas/30 px-5 py-4">
          {row(`Lecture series fees (${breakdown.seriesCount} × €${PRICES.lectureSeriesEur})`, `€${breakdown.courseFeesEur.toLocaleString('en-IE')}`)}
          {row(
            `Certificate exam fees (${breakdown.seriesCount} × €${programme === 'bachelor' ? PRICES.examCertBachelorEur : PRICES.examCertMasterEur})`,
            `€${breakdown.certFeesEur.toLocaleString('en-IE')}`
          )}
          {row('Programme final examination', `€${breakdown.finalFeeEur.toLocaleString('en-IE')}`)}
          <div className="my-3 h-px bg-gfa-border" />
          {row('Total (programme fees)', `€${breakdown.totalEur.toLocaleString('en-IE')}`)}

          <div className="mt-4 rounded-[10px] border border-gfa-border bg-gfa-rose/25 px-4 py-3">
            <label className="flex items-start gap-3 text-[13px] text-gfa-muted">
              <input
                type="checkbox"
                checked={includeAdmission}
                onChange={(e) => setIncludeAdmission(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[color:var(--color-gfa-accent)]"
              />
              <span>
                Include the one-time admission fee (USD) in the estimate.
                <span className="mt-1 block text-[12px] text-gfa-subtle">
                  Admission unlocks examinations, library, Campus, and office hours.
                </span>
              </span>
            </label>
            {includeAdmission ? (
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="text-gfa-muted">Admission (one-time)</span>
                <span className="tabular-nums text-gfa-fg-bright">${breakdown.admissionUsd}</span>
              </div>
            ) : null}
          </div>

          {row('Instructor share', '25% of lecture series fees', true)}
          {row('Exam + final exam fees', '100% retained by the Academy', true)}
        </div>
      </CardContent>
    </Card>
  )
}

