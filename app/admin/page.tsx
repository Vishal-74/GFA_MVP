import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

async function isAdmin(userId: string, supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
  return data?.role === 'admin'
}

export default async function AdminPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const ok = await isAdmin(user.id, supabase)
  if (!ok) redirect('/dashboard')

  const { data: reqRows } = await supabase
    .from('exam_schedule_requests')
    .select('id, user_id, course_id, level, status, preferred_times_text, created_at, scheduled_at, notes')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
      <Navigation />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Admin</p>
        <h1 className="mt-4 font-display text-3xl font-normal text-gfa-fg-bright">Scheduling requests</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">
          MVP queue. Update statuses directly in Supabase Studio for now (UI editor is next).
        </p>

        <div className="mt-10 space-y-3">
          {(reqRows || []).length === 0 ? (
            <p className="text-[14px] text-gfa-muted">No requests.</p>
          ) : (
            (reqRows || []).map((r: any) => (
              <div key={r.id} className="rounded-[12px] border border-gfa-border bg-gfa-rose/20 px-4 py-3">
                <p className="text-[14px] font-medium text-gfa-fg-bright">
                  {r.status} · {r.level} · {new Date(r.created_at).toLocaleString('en-GB')}
                </p>
                <p className="mt-1 text-[13px] text-gfa-muted">
                  user: <span className="text-gfa-fg">{r.user_id}</span> · course: <span className="text-gfa-fg">{r.course_id}</span>
                </p>
                {r.preferred_times_text ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-gfa-muted">{r.preferred_times_text}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

