import Navigation from '@/components/Navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ hash: string }> }

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { hash } = await params
  const supabase = await createServerSupabase()

  const { data: row } = await supabase
    .from('certificate_verifications')
    .select('hash, issued_at, user_id, course_id, courses(title)')
    .eq('hash', hash)
    .maybeSingle()

  if (!row) notFound()

  return (
    <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
      <Navigation />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Verification</p>
        <h1 className="mt-4 font-display text-3xl font-normal text-gfa-fg-bright">Certificate verification</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">
          This page verifies that a certificate hash was issued by the Global Freedom Academy platform.
        </p>

        <Card className="mt-10">
          <CardContent className="pt-6">
            <div className="space-y-2 text-[14px]">
              <p>
                <span className="text-gfa-muted">Status:</span> <span className="text-emerald-200">Valid</span>
              </p>
              <p>
                <span className="text-gfa-muted">Course:</span> <span className="text-gfa-fg-bright">{(row as any).courses?.title || row.course_id}</span>
              </p>
              <p>
                <span className="text-gfa-muted">Issued:</span>{' '}
                <span className="text-gfa-fg">{new Date(row.issued_at as string).toLocaleString('en-GB')}</span>
              </p>
              <p className="pt-2 text-[12px] text-gfa-subtle break-all">
                Hash: <span className="text-gfa-muted">{row.hash}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

