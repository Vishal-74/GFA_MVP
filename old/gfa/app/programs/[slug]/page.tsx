import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicShell } from '@/components/PublicShell'
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

  return (
    <PublicShell>
      <div>
        <Link href="/programs" className="text-[13px] text-gfa-muted transition-colors hover:text-gfa-accent">
          {pd.backToPrograms}
        </Link>
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-muted">{program.kind}</p>
        <h1 className="mt-3 font-display text-[clamp(1.85rem,4.5vw,2.75rem)] font-normal leading-tight text-gfa-fg-bright">
          {program.title}
        </h1>
        {program.description ? (
          <p className="mt-4 text-[16px] leading-relaxed text-gfa-muted">{program.description}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-4 text-[13px] text-gfa-subtle">
          {program.semester_count != null ? <span>{program.semester_count} semesters (structure)</span> : null}
          {program.lecture_series_count != null ? (
            <span>{program.lecture_series_count} lecture series</span>
          ) : null}
        </div>

        <div className="mt-10 space-y-4 rounded-2xl border border-gfa-border bg-gfa-rose/40 p-6 text-[14px] leading-relaxed text-gfa-muted">
          <div>
            <p className="font-medium text-gfa-fg/90">{pd.pricingSectionTitle}</p>
            <p className="mt-2">{pd.getPricingBody()}</p>
          </div>
          <p className="text-[13px] text-gfa-subtle">{GFA_EXAM_PHILOSOPHY}</p>
        </div>

        <ol className="mt-12 space-y-4">
          {sorted.map((row) => {
            const c = row.courses!
            return (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-gfa-border bg-gfa-surface/80 px-4 py-4 sm:px-6"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gfa-border text-[13px] font-semibold text-gfa-muted">
                  {row.sequence_order}
                </span>
                <span className="text-2xl" aria-hidden>
                  {catalogEmoji(c.catalog_emoji)}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/courses/${c.slug}`}
                    className="text-[16px] font-medium text-gfa-fg-bright hover:text-gfa-accent-soft"
                  >
                    {c.title}
                  </Link>
                  {c.description ? (
                    <p className="mt-1 line-clamp-2 text-[13px] text-gfa-muted">{c.description}</p>
                  ) : null}
                </div>
                <Link
                  href={`/courses/${c.slug}`}
                  className="shrink-0 text-[13px] font-medium text-gfa-accent-bright hover:text-gfa-accent-soft"
                >
                  {common.openSeriesCta}
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </PublicShell>
  )
}
