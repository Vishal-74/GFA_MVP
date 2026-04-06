import Link from 'next/link'
import { PublicShell } from '@/components/PublicShell'
import { GFA_EXAMINATION_FORMATS_DOC, GFA_PLATFORM_FEATURES } from '@/lib/gfa-brand'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default function PlatformHubPage() {
  const p = siteCopy.platform
  const common = siteCopy.common

  return (
    <PublicShell>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-muted">{p.eyebrow}</p>
        <h1 className="mt-4 font-display text-[clamp(1.85rem,4.5vw,2.75rem)] font-normal text-gfa-fg-bright">{p.title}</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-gfa-muted">{p.description}</p>

        <section className="mt-14">
          <h2 className="font-display text-xl text-gfa-fg-bright">{p.coreFeatures}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {GFA_PLATFORM_FEATURES.map((f) => (
              <li key={f} className="rounded-xl border border-gfa-border/80 bg-gfa-surface/50 px-4 py-3 text-[14px] text-gfa-muted">
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl text-gfa-fg-bright">{p.examFormats}</h2>
          <ul className="mt-4 space-y-2 text-[14px] text-gfa-muted">
            {GFA_EXAMINATION_FORMATS_DOC.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gfa-accent-bright">·</span>
                {f}
              </li>
            ))}
          </ul>
        </section>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {p.links.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block h-full rounded-2xl border border-gfa-border bg-gfa-rose/30 p-6 transition-colors hover:border-gfa-accent/35"
              >
                <p className="font-medium text-gfa-fg-bright">{item.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-gfa-muted">{item.body}</p>
                <p className="mt-4 text-[13px] font-medium text-gfa-accent-bright">{common.openCta}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PublicShell>
  )
}
