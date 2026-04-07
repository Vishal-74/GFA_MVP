import Link from 'next/link'
import { PublicShell } from '@/components/PublicShell'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

/** Ch. 8 — additional revenue: virtual offices for companies, agencies, and scouts (placeholder). */
export default function PartnerOfficesPage() {
  const p = siteCopy.partnerOffices

  return (
    <PublicShell>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-muted">{p.eyebrow}</p>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-normal text-gfa-fg-bright">{p.title}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-gfa-muted">{p.description}</p>
        <div className="mt-12 rounded-2xl border border-dashed border-gfa-border bg-gfa-rose/20 p-8 text-[15px] leading-relaxed text-gfa-muted">
          {p.placeholder}
        </div>
        <p className="mt-8 text-[14px] text-gfa-subtle">
          <Link href="/programs" className="text-gfa-accent-bright hover:underline">
            {p.viewProgrammes}
          </Link>{' '}
          ·{' '}
          <Link href="/" className="text-gfa-accent-bright hover:underline">
            {p.home}
          </Link>
        </p>
      </div>
    </PublicShell>
  )
}
