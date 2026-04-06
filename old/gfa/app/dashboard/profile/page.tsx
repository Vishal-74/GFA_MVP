'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

type ProfileRow = { id: string; display_name: string | null; locale: string | null }
type PassedExam = {
  id: string
  course_id: string
  status: string
  reviewed_at: string | null
  courses: { id: string; slug: string; title: string } | null
}

export const dynamic = 'force-dynamic'

export default function ProfileAndCertificatesPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [name, setName] = useState('')
  const [locale, setLocale] = useState('en')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [passedExams, setPassedExams] = useState<PassedExam[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setLoading(true)
      try {
        const { data: auth } = await supabase.auth.getUser()
        const user = auth.user
        if (!user) {
          window.location.href = '/login'
          return
        }
        if (cancelled) return
        setUserId(user.id)
        setEmail(user.email ?? null)

        const { data: prof } = await supabase
          .from('profiles')
          .select('id, display_name, locale')
          .eq('id', user.id)
          .maybeSingle()

        if (cancelled) return
        setProfile((prof || null) as ProfileRow | null)
        setName(((prof as any)?.display_name as string | null) || user.user_metadata?.full_name || '')
        setLocale(((prof as any)?.locale as string | null) || 'en')

        const { data: exams } = await supabase
          .from('exams')
          .select('id, course_id, status, reviewed_at, courses(id, slug, title)')
          .eq('user_id', user.id)
          .eq('status', 'passed')
          .order('reviewed_at', { ascending: false, nullsFirst: false })

        if (!cancelled) setPassedExams((exams || []) as PassedExam[])
      } catch {
        setError('Failed to load profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const hasChanges = useMemo(() => {
    if (!profile) return true
    return (profile.display_name || '') !== name || (profile.locale || 'en') !== locale
  }, [profile, name, locale])

  async function save() {
    if (!userId) return
    setSaving(true)
    setError(null)
    try {
      const { error: upErr } = await supabase.from('profiles').upsert({
        id: userId,
        display_name: name.trim() || null,
        locale: locale.trim() || 'en',
      })
      if (upErr) {
        setError(upErr.message)
        return
      }
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, display_name, locale')
        .eq('id', userId)
        .maybeSingle()
      setProfile((prof || null) as ProfileRow | null)
    } catch {
      setError('Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[14px] text-gfa-muted">Loading profile…</p>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Account</p>
        <h1 className="mt-3 font-display text-3xl font-normal text-gfa-fg-bright">Profile & certificates</h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-gfa-muted">
          Your profile and earned certificates. Certificates are generated from passed lecture-series examinations.
        </p>
      </div>

      {error ? (
        <div className="rounded-[10px] border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-300/90">
          {error}
        </div>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <p className="text-[14px] font-medium text-gfa-fg-bright">Profile</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-[13px] text-gfa-muted">
              <span>Display name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="space-y-2 text-[13px] text-gfa-muted">
              <span>Locale</span>
              <Input value={locale} onChange={(e) => setLocale(e.target.value)} placeholder="en" />
            </label>
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-gfa-muted">Email: <span className="text-gfa-fg">{email || '—'}</span></p>
              <Button type="button" onClick={save} disabled={saving || !hasChanges} size="sm">
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-[14px] font-medium text-gfa-fg-bright">Certificates</p>
          {passedExams.length === 0 ? (
            <p className="mt-3 text-[13px] text-gfa-muted">No certificates yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {passedExams.map((e) => (
                <li key={e.id} className="rounded-[12px] border border-gfa-border bg-gfa-canvas/20 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-medium text-gfa-fg-bright">{e.courses?.title || 'Lecture series'}</p>
                      <p className="mt-1 text-[12px] text-gfa-muted">
                        Passed · {e.reviewed_at ? new Date(e.reviewed_at).toLocaleDateString('en-GB') : '—'}
                      </p>
                    </div>
                    {e.courses?.slug ? (
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/exam/${e.course_id}`}>Open certificate</Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[12px] text-gfa-subtle">
            Verification URLs and public profiles are part of the next credentialing milestone.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

