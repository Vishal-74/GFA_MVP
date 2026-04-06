import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicShell } from '@/components/PublicShell'
import { ProfileCard } from '@/components/ui/profile-card'
import { siteCopy } from '@/lib/site-content'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export default async function FacultyDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const c = siteCopy.facultyDetail

  const { data: faculty, error } = await supabase
    .from('faculties')
    .select(
      'id, slug, name, description, faculty_lecturers(sort_order, lecturers(id, slug, display_name, bio, languages))'
    )
    .eq('slug', slug)
    .maybeSingle()

  if (error || !faculty) {
    notFound()
  }

  type FlRow = {
    sort_order: number
    lecturers: { id: string; slug: string; display_name: string; bio: string | null; languages: string[] | null } | null
  }

  const rawLinks = (faculty.faculty_lecturers || []) as unknown as FlRow[]
  const sorted = [...rawLinks]
    .map((l) => {
      const lecRaw = l.lecturers as unknown
      const lec = Array.isArray(lecRaw) ? lecRaw[0] : lecRaw
      return { sort_order: l.sort_order, lecturers: lec as FlRow['lecturers'] }
    })
    .filter((l) => l.lecturers)
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <PublicShell>
      <div>
        <Link href="/faculties" className="text-[13px] text-gfa-muted transition-colors hover:text-gfa-accent">
          {c.back}
        </Link>
        <h1 className="mt-6 font-display text-[clamp(1.85rem,4.5vw,2.75rem)] font-normal leading-tight text-gfa-fg-bright">
          {faculty.name}
        </h1>
        {faculty.description ? (
          <p className="mt-4 text-[16px] leading-relaxed text-gfa-muted">{faculty.description}</p>
        ) : null}

        <h2 className="mt-14 text-sm font-semibold uppercase tracking-[0.2em] text-gfa-subtle">{c.instructorOffices}</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 sm:items-stretch">
          {sorted.length === 0 ? (
            <li className="text-[15px] text-gfa-subtle">{c.instructorEmpty}</li>
          ) : (
            sorted.map((row) => {
              const lec = row.lecturers!
              return (
                <li key={lec.id} className="flex h-full min-h-0">
                  <Link href={`/instructors/${lec.slug}`} className="flex min-h-0 w-full flex-1">
                    <ProfileCard
                      className="max-w-none w-full"
                      name={lec.display_name}
                      title={lec.bio || c.instructorCardFallback}
                      showFollowButton={true}
                      showStats={false}
                      showSocialIcons={false}
                    />
                  </Link>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </PublicShell>
  )
}
