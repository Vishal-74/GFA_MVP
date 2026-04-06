'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      const msg =
        e instanceof TypeError
          ? 'Network error (often missing Supabase URL). Put NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local at the repo root or in old/gfa, then restart `npm run dev`.'
          : 'Something went wrong. Try again.'
      setError(msg)
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/dashboard` },
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gfa-canvas px-4">
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(245, 158, 11, 0.1), transparent)',
        }}
      />
      <div className="relative w-full max-w-[400px] space-y-10">
        <div className="text-center">
          <Link href="/" className="font-display text-3xl tracking-tight text-gfa-fg">
            GFA
          </Link>
          <p className="mt-2 text-[13px] tracking-wide text-gfa-muted">
            Global Freedom Academy
          </p>
        </div>

        <Card className="bg-gfa-rose/30">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-normal">Sign in</CardTitle>
            <CardDescription>Welcome back.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {error ? (
              <div className="mb-5 rounded-[10px] border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-300/90">
                {error}
              </div>
            ) : null}

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoComplete="email"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoComplete="current-password"
              />
            </div>

            <Button type="button" onClick={handleLogin} disabled={loading} size="pill" className="mt-6 w-full">
              {loading ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gfa-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gfa-rose/30 px-3 text-[11px] uppercase tracking-[0.2em] text-gfa-subtle">
                or
              </span>
            </div>
          </div>

            <Button type="button" onClick={handleGoogleLogin} variant="secondary" size="pill" className="w-full">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
            </Button>

          <p className="mt-8 text-center text-[13px] text-gfa-muted">
            No account?{' '}
            <Link href="/signup" className="text-gfa-accent transition-colors hover:text-gfa-accent-bright">
              Sign up
            </Link>
          </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
