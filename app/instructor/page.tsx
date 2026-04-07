import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function isLecturer(userId: string, supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
  return data?.role === 'lecturer' || data?.role === 'admin'
}

export default async function InstructorHomePage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const ok = await isLecturer(user.id, supabase)
  if (!ok) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
      <Navigation />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Instructor</p>
        <h1 className="mt-4 font-display text-3xl font-normal text-gfa-fg-bright">Instructor dashboard (MVP)</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">
          MVP: use this area to track student requests and (soon) manage office hours. Full content upload and revenue dashboards come next.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/admin"
            className="block rounded-[12px] border border-gfa-border bg-gfa-rose/20 px-4 py-3 text-[14px] text-gfa-fg hover:border-gfa-border-strong"
          >
            View scheduling request queue (admin view)
          </Link>
          <p className="text-[12px] text-gfa-subtle">
            Office hours slot management is wired in DB, but the instructor UI editor is the next step.
          </p>
        </div>
      </main>
    </div>
  )
}

