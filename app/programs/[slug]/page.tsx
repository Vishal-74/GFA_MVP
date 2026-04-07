import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicShell } from '@/components/PublicShell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GFA_EXAM_PHILOSOPHY } from '@/lib/gfa-brand'
import { siteCopy } from '@/lib/site-content'
import { createServerSupabase } from '@/lib/supabase-server'
import { catalogEmoji } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const pd = siteCopy.programDetail
  const common = siteCopy.common

  const { data: program, error } = await supabase
    .from('gfa_programs')
    .select(
      'id, slug, title, kind, description, semester_count, lecture_series_count, gfa_program_courses(sequence_order, courses(id, slug, title, description, catalog_emoji))'
    )
    .eq('slug', slug)
    .maybeSingle()

  if (error || !program) {
    notFound()
  }

  type PcRow = {
    sequence_order: number
    courses: {
      id: string
      slug: string
      title: string
      description: string | null
      catalog_emoji: string | null
    } | null
  }

  const rawRows = (program.gfa_program_courses || []) as unknown as PcRow[]
  const sorted = [...rawRows]
    .map((r) => {
      const cRaw = r.courses as unknown
      const c = Array.isArray(cRaw) ? cRaw[0] : cRaw
      return { sequence_order: r.sequence_order, courses: c as PcRow['courses'] }
    })
    .filter((r) => r.courses)
    .sort((a, b) => a.sequence_order - b.sequence_order)

  const kindLabel =
    program.kind === 'bachelor' ? 'Bachelor' : program.kind === 'master' ? 'Master' : (program.kind ?? 'Programme')
  const summaryStats = [
    program.semester_count != null ? { label: 'Semesters', value: String(program.semester_count) } : null,
    program.lecture_series_count != null
      ? { label: 'Lecture series', value: String(program.lecture_series_count) }
      : null,
    { label: 'Series in map', value: String(sorted.length) },
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <PublicShell>
      <div className="relative">
        <Link href="/programs" className="text-[13px] text-gfa-muted transition-colors hover:text-gfa-accent">
          {pd.backToPrograms}
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge variant="accent">{kindLabel}</Badge>
          {program.semester_count != null ? <Badge>{program.semester_count} semesters</Badge> : null}
          {program.lecture_series_count != null ? <Badge>{program.lecture_series_count} series</Badge> : null}
        </div>

        <h1 className="mt-4 font-display text-[clamp(1.95rem,4.6vw,3rem)] font-normal leading-tight text-gfa-fg-bright">
          {program.title}
        </h1>
        {program.description ? (
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-gfa-muted">{program.description}</p>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <section className="min-w-0">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Programme map</p>
                <p className="mt-2 text-[14px] leading-relaxed text-gfa-muted">
                  Follow the sequence below. Each row is one lecture series — open it for syllabus, pricing, and learning.
                </p>
              </div>
              <div className="hidden flex-wrap justify-end gap-2 sm:flex">
                {summaryStats.slice(0, 2).map((s) => (
                  <div key={s.label} className="rounded-full border border-gfa-border bg-gfa-rose/25 px-3 py-1 text-[11px] text-gfa-subtle">
                    <span className="text-gfa-muted">{s.label}:</span> {s.value}
                  </div>
                ))}
              </div>
            </div>

            <ol className="mt-6 space-y-4">
              {sorted.map((row) => {
                const c = row.courses!
                return (
                  <li
                    key={c.id}
                    className="group flex flex-wrap items-center gap-4 rounded-2xl border border-gfa-border bg-gfa-surface/80 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gfa-accent/25 hover:bg-gfa-rose/20 hover:shadow-sm hover:shadow-black/20 sm:px-6"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gfa-border bg-gfa-rose/20 text-[13px] font-semibold text-gfa-muted">
                      {row.sequence_order}
                    </span>
                    <span className="text-2xl" aria-hidden>
                      {catalogEmoji(c.catalog_emoji)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/courses/${c.slug}`}
                        className="text-[16px] font-medium text-gfa-fg-bright transition-colors hover:text-gfa-accent-soft focus-visible:outline-none"
                      >
                        {c.title}
                      </Link>
                      {c.description ? (
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-gfa-muted">{c.description}</p>
                      ) : null}
                    </div>
                    <Link
                      href={`/courses/${c.slug}`}
                      className="shrink-0 rounded-full border border-transparent px-2.5 py-1 text-[13px] font-medium text-gfa-accent-bright transition-colors hover:text-gfa-accent-soft group-hover:border-gfa-accent/20 group-hover:bg-gfa-rose/20"
                    >
                      {common.openSeriesCta}
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-[18px] font-normal">{pd.pricingSectionTitle}</CardTitle>
                <CardDescription>Fees are modular; progress series-by-series.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[14px] leading-relaxed text-gfa-muted">{pd.getPricingBody()}</p>
                <div className="grid grid-cols-3 gap-3">
                  {summaryStats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-[12px] border border-gfa-border bg-gfa-rose/20 px-3 py-3"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gfa-subtle">
                        {s.label}
                      </p>
                      <p className="mt-1 text-[18px] font-semibold text-gfa-fg-bright">{s.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed text-gfa-subtle">{GFA_EXAM_PHILOSOPHY}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-[18px] font-normal">Next steps</CardTitle>
                <CardDescription>Browse programmes or jump into the catalogue.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link
                  href="/courses"
                  className="rounded-full border border-gfa-border bg-gfa-rose/25 px-3 py-2 text-[13px] font-medium text-gfa-fg-bright transition-colors hover:bg-gfa-rose/35"
                >
                  Browse lecture series →
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-full border border-gfa-border bg-gfa-rose/25 px-3 py-2 text-[13px] font-medium text-gfa-fg-bright transition-colors hover:bg-gfa-rose/35"
                >
                  Review fees →
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PublicShell>
  )
}
