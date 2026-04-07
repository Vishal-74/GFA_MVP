import Link from 'next/link'
import HomeLanguagePicker from '@/components/HomeLanguagePicker'
import { PublicShell } from '@/components/PublicShell'
import { PageHeader } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GFA_BACHELOR_STRUCTURE,
  GFA_ENROLLMENT_PITCH_BODY,
  GFA_ENROLLMENT_PITCH_TITLE,
  GFA_FEE_SCHEDULE,
  GFA_MASTER_STRUCTURE,
  GFA_MISES_ATTRIBUTION,
  GFA_MISES_QUOTE,
  GFA_PLATFORM_FEATURES,
  GFA_SUBTITLE,
  GFA_TAGLINE,
  GFA_USER_JOURNEY,
  GFA_WELCOME_STATEMENT,
} from '@/lib/gfa-brand'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default function Home() {
  const h = siteCopy.home
  const common = siteCopy.common

  return (
    <PublicShell className="relative min-h-[100dvh]">
      <div
        className="pointer-events-none fixed inset-0 opacity-100"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -15%, rgba(96, 165, 250, 0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(59, 130, 246, 0.06), transparent)',
        }}
      />

      <div className="relative z-10">
        <Badge variant="accent">{h.heroBadge}</Badge>
        <PageHeader
          title={h.heroTitle}
          description={GFA_TAGLINE}
          actions={
            <>
              <Button asChild size="pill">
                <Link href="/programs">{h.chooseProgramme}</Link>
              </Button>
              <Button asChild size="pill" variant="secondary">
                <Link href="/courses">{h.browseLectureSeries}</Link>
              </Button>
            </>
          }
        />

        <Card className="gfa-muted-shadow">
          <CardContent className="pt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-subtle">{GFA_SUBTITLE}</p>
            <blockquote className="mt-6 border-l-2 border-gfa-accent/40 pl-5">
              <p className="font-display text-[18px] font-normal italic leading-snug text-gfa-fg-bright">
                “{GFA_MISES_QUOTE}”
              </p>
              <footer className="mt-3 text-[13px] text-gfa-muted">— {GFA_MISES_ATTRIBUTION}</footer>
            </blockquote>

            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
              <div className="rounded-[12px] border border-gfa-border bg-gfa-canvas/20 p-5">
                <HomeLanguagePicker />
              </div>
              <div className="rounded-[12px] border border-gfa-border bg-gfa-canvas/20 p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-subtle">{h.welcomeEyebrow}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">{GFA_WELCOME_STATEMENT}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="relative z-10 mt-16">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-subtle">
          {h.howToParticipateEyebrow}
        </p>
        <h2 className="mt-3 text-center font-display text-[clamp(1.35rem,4vw,2rem)] font-normal text-gfa-fg-bright">
          {h.journeyHeading}
        </h2>
        <ol className="mt-10 space-y-6">
          {GFA_USER_JOURNEY.map((j) => (
            <li key={j.step}>
              <Link
                href={j.href}
                className="flex gap-4 rounded-[12px] border border-gfa-border bg-gfa-rose/20 p-5 text-left transition-colors hover:border-gfa-accent/35"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gfa-accent/40 font-display text-lg text-gfa-accent-bright">
                  {j.step}
                </span>
                <div>
                  <p className="font-medium text-gfa-fg-bright">{j.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-gfa-muted">{j.body}</p>
                  <p className="mt-2 text-[13px] text-gfa-accent-bright">{common.continueCta}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="relative z-10 mt-16 grid gap-4 md:grid-cols-3">
        {h.pillarCards.map((item) => (
          <Card key={item.title} className="gfa-muted-shadow">
            <CardContent className="pt-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gfa-subtle">{item.title}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="relative z-10 mt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-subtle">{h.programmeStructureEyebrow}</p>
        <h2 className="mt-3 font-display text-[clamp(1.35rem,4vw,2rem)] font-normal text-gfa-fg-bright">
          {h.programmeStructureTitle}
        </h2>
        <p className="mt-6 text-left text-[14px] leading-relaxed text-gfa-muted">
          <strong className="font-medium text-gfa-fg/90">{h.bachelorLabel}</strong> {GFA_BACHELOR_STRUCTURE}
        </p>
        <p className="mt-4 text-left text-[14px] leading-relaxed text-gfa-muted">
          <strong className="font-medium text-gfa-fg/90">{h.masterLabel}</strong> {GFA_MASTER_STRUCTURE}
        </p>
      </section>

      <section className="relative z-10 mt-16">
        <Card className="gfa-muted-shadow">
          <CardContent className="pt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-subtle">{h.transparentFeesEyebrow}</p>
            <ul className="mt-4 space-y-2 text-left text-[14px] leading-relaxed text-gfa-muted">
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
              <li className="pt-2 text-[13px] text-gfa-subtle">{GFA_FEE_SCHEDULE.instructorShare}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="relative z-10 mt-16">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-subtle">
          {h.platformFeaturesEyebrow}
        </p>
        <h2 className="mt-3 text-center font-display text-[clamp(1.25rem,3.5vw,1.75rem)] font-normal text-gfa-fg-bright">
          {h.platformFeaturesTitle}
        </h2>
        <ul className="mt-6 grid gap-2 text-left text-[14px] text-gfa-muted sm:grid-cols-2">
          {GFA_PLATFORM_FEATURES.map((f) => (
            <li key={f} className="flex gap-2 rounded-lg border border-gfa-border/60 bg-gfa-canvas/30 px-3 py-2">
              <span className="text-gfa-accent-bright" aria-hidden>
                ·
              </span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      <div className="relative z-10 mt-16 pb-8 text-center">
        <p className="text-[clamp(0.625rem,1.8vw,0.6875rem)] font-medium uppercase tracking-[0.38em] text-gfa-subtle">
          {h.enrollmentEyebrow}
        </p>
        <p className="mt-[clamp(1rem,3vw,1.25rem)] font-display text-[clamp(1.25rem,4vw,1.85rem)] font-normal leading-snug text-gfa-fg-bright">
          {GFA_ENROLLMENT_PITCH_TITLE}
        </p>
        <p className="mt-[clamp(0.875rem,3vw,1.5rem)] text-[clamp(0.875rem,2.5vw,1.0625rem)] leading-relaxed text-gfa-muted">
          {GFA_ENROLLMENT_PITCH_BODY}
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild size="pill">
            <Link href="/dashboard">One-time admission fee →</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  )
}
