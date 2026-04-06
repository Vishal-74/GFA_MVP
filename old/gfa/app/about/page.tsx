import Link from 'next/link'
import {
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  Handshake,
  Scale,
  Users,
} from 'lucide-react'
import { PublicShell } from '@/components/PublicShell'
import { PageHeader } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GFA_EXAM_PHILOSOPHY } from '@/lib/gfa-brand'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default function AboutPage() {
  const a = siteCopy.about

  return (
    <PublicShell>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 -top-px h-32 opacity-90"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(59, 130, 246, 0.09), transparent 55%)',
          }}
        />

        <PageHeader eyebrow={a.eyebrow} title={a.title} description={a.description} />

        <section className="relative mt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">{a.pillarsSectionEyebrow}</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card className="gfa-muted-shadow transition-[border-color,box-shadow] duration-300 hover:border-gfa-accent/30 hover:shadow-[0_20px_50px_-40px_rgba(59,130,246,0.25)]">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gfa-border bg-gfa-accent-muted/50 text-gfa-accent-bright">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-normal text-gfa-fg-bright">{a.whatIsBuiltTitle}</h2>
                    <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">{a.whatIsBuiltP1}</p>
                    <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">{a.whatIsBuiltP2}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gfa-muted-shadow transition-[border-color,box-shadow] duration-300 hover:border-gfa-accent/30 hover:shadow-[0_20px_50px_-40px_rgba(59,130,246,0.25)]">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gfa-border bg-gfa-accent-muted/50 text-gfa-accent-bright">
                    <Scale className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-normal text-gfa-fg-bright">{a.rigorTitle}</h2>
                    <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">{GFA_EXAM_PHILOSOPHY}</p>
                    <ul className="mt-4 space-y-2.5 text-[14px] text-gfa-muted">
                      {a.rigorBullets.map((line) => (
                        <li key={line} className="flex gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gfa-accent-bright" aria-hidden />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="relative mt-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">{a.audienceSectionEyebrow}</p>
          <h2 className="mt-2 font-display text-[clamp(1.25rem,3vw,1.75rem)] font-normal text-gfa-fg-bright">
            {a.audienceSectionTitle}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {a.audienceCards.map((b, i) => {
              const Icon = [Users, GraduationCap, Handshake][i] ?? Users
              return (
                <Card
                  key={b.title}
                  className="transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-gfa-accent/35 hover:shadow-[0_16px_48px_-36px_rgba(59,130,246,0.3)]"
                >
                  <CardContent className="pt-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gfa-border/80 bg-gfa-rose/40 text-gfa-accent-bright">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-gfa-subtle">{b.title}</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-gfa-muted">{b.body}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <Card className="relative mt-14 overflow-hidden border-gfa-border-strong/80 bg-gradient-to-br from-gfa-accent-muted/25 via-gfa-rose/30 to-gfa-canvas/40 gfa-muted-shadow">
          <CardContent className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gfa-accent/30 bg-gfa-canvas/40 text-gfa-accent-bright">
                <BookOpen className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <Badge variant="accent" className="mb-2">
                  {a.eyebrow}
                </Badge>
                <h3 className="font-display text-xl font-normal text-gfa-fg-bright">{a.ctaHeading}</h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-gfa-muted">{a.ctaBody}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3 sm:flex-col sm:items-stretch">
              <Button asChild size="lg" className="min-w-[10rem]">
                <Link href="/programs">{a.ctaProgrammes}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="min-w-[10rem]">
                <Link href="/pricing">{a.ctaPricing}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  )
}
