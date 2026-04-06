import { PublicShell } from '@/components/PublicShell'
import { PageHeader } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { PricingSection } from '@/components/ui/pricing'
import PricingCalculator from '@/components/PricingCalculator'
import { GFA_FEE_SCHEDULE, GFA_INSTITUTION } from '@/lib/gfa-brand'
import { GFA_PRICING_PLANS } from '@/lib/gfa-pricing-plans'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default function PricingPage() {
  const p = siteCopy.pricing

  return (
    <PublicShell>
      <div>
        <PageHeader eyebrow={GFA_INSTITUTION} title={p.title} description={p.description} />

        <div className="mt-10">
          <PricingSection plans={GFA_PRICING_PLANS} />
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <PricingCalculator />
          <div className="grid gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">{p.feeScheduleEyebrow}</p>
                <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-gfa-muted">
                  <li>
                    <span className="font-medium text-gfa-fg/90">{GFA_FEE_SCHEDULE.admissionUsd.label}:</span>{' '}
                    {GFA_FEE_SCHEDULE.admissionUsd.amount} (USD)
                  </li>
                  <li>
                    <span className="font-medium text-gfa-fg/90">Lecture series:</span> {GFA_FEE_SCHEDULE.lectureSeriesEur.amount}{' '}
                    {GFA_FEE_SCHEDULE.lectureSeriesEur.detail}
                  </li>
                  <li>{GFA_FEE_SCHEDULE.examCertBachelorEur}</li>
                  <li>{GFA_FEE_SCHEDULE.examCertMasterEur}</li>
                  <li>{GFA_FEE_SCHEDULE.finalExamBachelorEur}</li>
                  <li>{GFA_FEE_SCHEDULE.finalExamMasterEur}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">{p.notesEyebrow}</p>
                <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-gfa-muted">
                  {p.notes.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-gfa-accent-bright">·</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicShell>
  )
}
