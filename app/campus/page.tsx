import { redirect } from 'next/navigation'
import { PublicShell } from '@/components/PublicShell'
import AdmissionRequiredPanel from '@/components/AdmissionRequiredPanel'
import { createServerSupabase } from '@/lib/supabase-server'
import { userHasAdmission } from '@/lib/gfa-access'
import CampusChatClient from '@/components/CampusChatClient'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default async function CampusPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admitted = await userHasAdmission(supabase, user.id)
  const c = siteCopy.campus

  return (
    <PublicShell>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-muted">{c.eyebrow}</p>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-normal text-gfa-fg-bright">{c.title}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-gfa-muted">{c.description}</p>

        {!admitted ? (
          <div className="mt-12">
            <AdmissionRequiredPanel />
          </div>
        ) : (
          <div className="mt-12">
            <CampusChatClient />
          </div>
        )}
      </div>
    </PublicShell>
  )
}
