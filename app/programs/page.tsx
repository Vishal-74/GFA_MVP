import Link from 'next/link'
import { PublicShell } from '@/components/PublicShell'
import { PageHeader } from '@/components/ui/container'
import { InteractiveProductCard } from '@/components/ui/card-7'
import { Badge } from '@/components/ui/badge'
import { programCardImageUrl } from '@/lib/program-card-visuals'
import { siteCopy } from '@/lib/site-content'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function ProgramsPage() {
  const supabase = await createServerSupabase()
  const { data: programs } = await supabase.from('gfa_programs').select('*').order('kind', { ascending: true })
  const c = siteCopy.programs
  const list = programs || []
  const bachelorCount = list.filter((p) => p.kind === 'bachelor').length
  const masterCount = list.filter((p) => p.kind === 'master').length

  return (
    <PublicShell>
      <div>
        <PageHeader
          eyebrow={c.eyebrow}
          title={c.title}
          description={c.description}
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{list.length} programmes</Badge>
              {bachelorCount ? <Badge>{bachelorCount} bachelor</Badge> : null}
              {masterCount ? <Badge>{masterCount} master</Badge> : null}
            </div>
          }
        />
      </div>

      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:gap-10">
        {list.length === 0 ? (
          <li className="text-[15px] text-gfa-subtle">{c.empty}</li>
        ) : (
          list.map((p) => {
            const kindLabel =
              p.kind === 'bachelor' ? 'Bachelor' : p.kind === 'master' ? 'Master' : (p.kind ?? 'Programme')
            const stats = [
              p.semester_count != null ? `${p.semester_count} semesters` : null,
              p.lecture_series_count != null ? `${p.lecture_series_count} lecture series` : null,
            ].filter(Boolean)

            return (
              <li key={p.id} className="min-w-0">
                <Link
                  href={`/programs/${p.slug}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfa-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gfa-canvas"
                  aria-label={`Open programme: ${p.title}`}
                >
                  <InteractiveProductCard
                    className="h-full w-full max-w-none transition-transform duration-300 group-hover:-translate-y-0.5"
                    imageUrl={programCardImageUrl(p.slug)}
                    title={p.title}
                    description={
                      p.description ??
                      `${kindLabel} track — structured semesters, modular lecture series, and examinations on completion.`
                    }
                    price={kindLabel}
                    footerStats={stats.length ? stats.join(' · ') : 'Explore programme structure'}
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                    <Badge variant="accent">{kindLabel}</Badge>
                    {p.semester_count != null ? <Badge>{p.semester_count} sem</Badge> : null}
                    {p.lecture_series_count != null ? <Badge>{p.lecture_series_count} series</Badge> : null}
                    <span className="ml-auto text-[12px] font-medium text-gfa-accent-bright group-hover:text-gfa-accent-soft">
                      View map →
                    </span>
                  </div>
                </Link>
              </li>
            )
          })
        )}
      </ul>
    </PublicShell>
  )
}
