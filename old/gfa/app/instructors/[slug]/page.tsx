import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicShell } from '@/components/PublicShell'
import OfficeMuxPlayer from '@/components/OfficeMuxPlayer'
import { createServerSupabase } from '@/lib/supabase-server'
import { catalogEmoji, catalogGradientClass } from '@/lib/utils'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export default async function InstructorOfficePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const i = siteCopy.instructorDetail

  const { data: lecturer, error } = await supabase.from('lecturers').select('*').eq('slug', slug).maybeSingle()

  if (error || !lecturer) {
    notFound()
  }

  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, catalog_emoji, lectures(title, order_index)')
    .eq('lecturer_id', lecturer.id)
    .order('title', { ascending: true })

  const series = (courses || []).map((c) => {
    const rawLectures = c.lectures as unknown
    const list = Array.isArray(rawLectures) ? rawLectures : rawLectures ? [rawLectures] : []
    const lecs = [...list].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    return { ...c, lectures: lecs as { title: string; order_index: number }[] }
  })

  return (
    <PublicShell>
      <div>
        <Link href="/faculties" className="text-[13px] text-gfa-muted transition-colors hover:text-gfa-accent">
          {i.back}
        </Link>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          <div
            className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-gfa-border bg-gradient-to-br text-5xl ${catalogGradientClass(lecturer.slug)}`}
            aria-hidden
          >
            <span>🚪</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-muted">{i.eyebrow}</p>
            <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-normal leading-tight text-gfa-fg-bright">
              {lecturer.display_name}
            </h1>
            {lecturer.bio ? (
              <p className="mt-4 text-[16px] leading-relaxed text-gfa-muted">{lecturer.bio}</p>
            ) : null}
            {lecturer.languages?.length ? (
              <p className="mt-3 text-[13px] text-gfa-subtle">Teaching languages: {lecturer.languages.join(', ')}</p>
            ) : null}
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gfa-subtle">{i.welcomeTitle}</h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-gfa-muted">{i.welcomeBody}</p>
          <div className="mt-6 max-w-3xl">
            <OfficeMuxPlayer playbackId={lecturer.office_intro_mux_playback_id} />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gfa-subtle">{i.lectureListTitle}</h2>
          <ul className="mt-6 space-y-8">
            {series.length === 0 ? (
              <li className="text-[15px] text-gfa-subtle">{i.emptySeries}</li>
            ) : (
              series.map((c) => (
                <li key={c.id} className="rounded-2xl border border-gfa-border bg-gfa-surface/80 p-6">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="text-3xl" aria-hidden>
                      {catalogEmoji(c.catalog_emoji)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/courses/${c.slug}`}
                        className="text-[18px] font-medium text-gfa-fg-bright hover:text-gfa-accent-soft"
                      >
                        {c.title}
                      </Link>
                      <ol className="mt-4 space-y-2 border-l border-gfa-border pl-4">
                        {c.lectures.map((lec, idx) => (
                          <li key={`${c.id}-${idx}`} className="text-[14px] text-gfa-muted">
                            <span className="font-medium text-gfa-fg/80">{idx + 1}.</span> {lec.title}
                          </li>
                        ))}
                      </ol>
                      <Link
                        href={`/courses/${c.slug}`}
                        className="mt-4 inline-block text-[13px] font-medium text-gfa-accent-bright hover:text-gfa-accent-soft"
                      >
                        {i.openSeriesCta}
                      </Link>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <p className="mt-14 text-[13px] text-gfa-subtle">{i.footerNote}</p>
      </div>
    </PublicShell>
  )
}
