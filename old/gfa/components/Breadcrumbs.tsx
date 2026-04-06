'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'learning-path': 'My learning path',
  exams: 'Examination center',
  profile: 'Profile & certificates',
} as const

export default function Breadcrumbs() {
  const pathname = usePathname() || ''
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null

  const crumbs = parts.map((p, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/')
    const label = LABELS[p] || p.replace(/-/g, ' ')
    return { href, label }
  })

  return (
    <nav aria-label="Breadcrumb" className="text-[12px] text-gfa-subtle">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((c, idx) => (
          <li key={c.href} className="flex items-center gap-2">
            {idx === crumbs.length - 1 ? (
              <span className="text-gfa-muted">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-gfa-fg">
                {c.label}
              </Link>
            )}
            {idx === crumbs.length - 1 ? null : <span aria-hidden>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

