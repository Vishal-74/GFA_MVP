'use client'

import Link from 'next/link'
import GfaLogoLink from '@/components/GfaLogoLink'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const link = (active: boolean) =>
    cn(
      'relative rounded-full px-3 py-2 text-[14px] font-medium leading-snug tracking-normal transition-[color,background-color,box-shadow,transform] duration-200 sm:text-[15px]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfa-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-gfa-deep',
      active
        ? 'bg-gfa-accent-muted text-gfa-fg-bright shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] ring-1 ring-gfa-accent/30'
        : 'text-gfa-muted hover:bg-gfa-rose/30 hover:text-gfa-fg-bright active:scale-[0.98]'
    )

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 top-0 z-50 border-b border-gfa-border-strong/90 bg-gfa-deep/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gfa-deep/75"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2 sm:gap-x-3 sm:px-6 lg:px-10">
        <GfaLogoLink />
        <div
          className="hidden h-7 w-px shrink-0 bg-gradient-to-b from-transparent via-gfa-border-strong to-transparent md:block"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-1 gap-y-1.5 sm:gap-x-1.5">
          <Link href="/about" className={link(pathname === '/about')}>
            About
          </Link>
          <Link href="/programs" className={link(pathname?.startsWith('/programs') ?? false)}>
            Programmes
          </Link>
          <Link href="/faculties" className={link(pathname?.startsWith('/faculties') ?? false)}>
            Faculties
          </Link>
          <Link href="/courses" className={link(pathname?.startsWith('/courses') ?? false)}>
            Courses
          </Link>
          <Link href="/platform" className={link(pathname?.startsWith('/platform') ?? false)}>
            Platform
          </Link>
          <Link href="/pricing" className={link(pathname === '/pricing')}>
            Pricing
          </Link>
          <Link href="/faq" className={link(pathname === '/faq')}>
            FAQ
          </Link>
          {user ? (
            <>
              <Link href="/examinations" className={link(pathname?.startsWith('/examinations') ?? false)}>
                Exams
              </Link>
              <Link href="/dashboard" className={link(pathname?.startsWith('/dashboard') ?? false)}>
                Dashboard
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="md"
                className="h-10 rounded-full px-4 text-[14px] font-medium text-gfa-muted hover:bg-gfa-rose/35 hover:text-gfa-fg-bright"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="md"
                className="h-10 rounded-full px-4 text-[14px] font-medium text-gfa-muted hover:bg-gfa-rose/35 hover:text-gfa-fg-bright"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="md" className="h-10 rounded-full px-5 text-[14px] shadow-sm shadow-black/20">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
