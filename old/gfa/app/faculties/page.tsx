import Link from 'next/link'
import { PublicShell } from '@/components/PublicShell'
import { PageHeader } from '@/components/ui/container'
import { ProfileCard } from '@/components/ui/profile-card'
import { siteCopy } from '@/lib/site-content'
import { getSupabaseUrlHost } from '@/lib/supabase-env'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function FacultiesPage() {
  const supabase = await createServerSupabase()
  const { data: faculties, error } = await supabase
    .from('faculties')
    .select('*')
    .order('sort_order', { ascending: true })

  const host = getSupabaseUrlHost()
  const c = siteCopy.faculties

  return (
    <PublicShell>
      <div>
        <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
      </div>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 sm:items-stretch">
        {(faculties || []).length === 0 ? (
          <li className="text-[15px] text-gfa-subtle">
            {c.empty}
            {error ? (
              <span className="mt-3 block text-[13px] text-red-300/90">
                Query error: {error.message}
                {host ? <span className="block pt-2 text-gfa-subtle">Supabase: {host}</span> : null}
              </span>
            ) : null}
          </li>
        ) : (
          (faculties || []).map((f) => (
            <li key={f.id} className="flex h-full min-h-0">
              <Link href={`/faculties/${f.slug}`} className="flex min-h-0 w-full flex-1">
                <ProfileCard
                  className="max-w-none w-full"
                  name={f.name}
                  title={f.description || c.cardFallback}
                  showFollowButton={false}
                  showStats={false}
                  showSocialIcons={false}
                />
              </Link>
            </li>
          ))
        )}
      </ul>
    </PublicShell>
  )
}
