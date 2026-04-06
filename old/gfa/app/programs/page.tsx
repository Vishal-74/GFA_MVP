import Link from 'next/link'
import { PublicShell } from '@/components/PublicShell'
import { PageHeader } from '@/components/ui/container'
import { InteractiveProductCard } from '@/components/ui/card-7'
import { programCardImageUrl } from '@/lib/program-card-visuals'
import { siteCopy } from '@/lib/site-content'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function ProgramsPage() {
  const supabase = await createServerSupabase()
  const { data: programs } = await supabase.from('gfa_programs').select('*').order('kind', { ascending: true })
  const c = siteCopy.programs

  return (
    <PublicShell>
      <div>
        <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      </div>

          <ul className="mt-12 grid gap-8 sm:grid-cols-2 sm:items-stretch">
            {(programs || []).length === 0 ? (
              <li className="text-[15px] text-gfa-subtle">{c.empty}</li>
            ) : (
              (programs || []).map((p) => (
                <li key={p.id} className="flex h-full min-h-0 justify-center">
                  <Link
                    href={`/programs/${p.slug}`}
                    className="flex w-full max-w-[340px] flex-1 flex-col transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfa-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gfa-canvas"
                  >
                    <InteractiveProductCard
                      className="h-full w-full max-w-none"
                      imageUrl={programCardImageUrl(p.slug)}
                      title={p.title}
                      description={
                        p.description ??
                        `${p.kind === 'bachelor' ? 'Bachelor' : p.kind === 'master' ? 'Master' : 'Programme'} track — open for details.`
                      }
                      price={
                        p.kind === 'bachelor'
                          ? 'Bachelor'
                          : p.kind === 'master'
                            ? 'Master'
                            : (p.kind ?? 'Programme')
                      }
                      footerStats={`${p.semester_count ?? '—'} sem · ${p.lecture_series_count ?? '—'} series`}
                    />
                    <span className="sr-only">{c.cardSrOnly}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
    </PublicShell>
  )
}
