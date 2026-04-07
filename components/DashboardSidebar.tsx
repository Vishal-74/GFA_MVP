'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/learning-path', label: 'My learning path' },
  { href: '/dashboard/exams', label: 'Examination center' },
  { href: '/library', label: 'Digital library' },
  { href: '/campus', label: 'Campus' },
  { href: '/dashboard/profile', label: 'Profile & certificates' },
] as const

export default function DashboardSidebar() {
  const pathname = usePathname() || ''

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gfa-border bg-gfa-deep/30 lg:block">
      <nav className="sticky top-14 space-y-1 p-4">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Student</p>
        {ITEMS.map((it) => {
          const active = pathname === it.href || (it.href !== '/dashboard' && pathname.startsWith(it.href))
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'block rounded-[10px] px-3 py-2 text-[13px] tracking-wide transition-colors',
                active ? 'bg-gfa-rose/40 text-gfa-fg-bright' : 'text-gfa-muted hover:bg-gfa-rose/25 hover:text-gfa-fg'
              )}
            >
              {it.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

