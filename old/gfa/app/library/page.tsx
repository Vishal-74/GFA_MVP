import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PublicShell } from '@/components/PublicShell'
import AdmissionRequiredPanel from '@/components/AdmissionRequiredPanel'
import { createServerSupabase } from '@/lib/supabase-server'
import { userHasAdmission } from '@/lib/gfa-access'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admitted = await userHasAdmission(supabase, user.id)
  const lib = siteCopy.library

  return (
    <PublicShell>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-muted">{lib.eyebrow}</p>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-normal text-gfa-fg-bright">{lib.title}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-gfa-muted">{lib.description}</p>

        {!admitted ? (
          <div className="mt-12">
            <AdmissionRequiredPanel />
          </div>
        ) : (
          <div className="mt-12 space-y-6 rounded-2xl border border-gfa-border bg-gfa-surface/60 p-8">
            <p className="text-[15px] leading-relaxed text-gfa-muted">{lib.admittedBody}</p>
            <ul className="list-inside list-disc space-y-2 text-[14px] text-gfa-muted">
              {lib.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Link href="/courses" className="inline-block text-[14px] font-medium text-gfa-accent-bright hover:underline">
              {lib.browseCta}
            </Link>
          </div>
        )}
      </div>
    </PublicShell>
  )
}
