'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Channel = { id: string; slug: string | null; name: string; kind: 'public' | 'dm' }
type Message = { id: string; channel_id: string; user_id: string; body: string; created_at: string }

export default function CampusChatClient() {
  const [userId, setUserId] = useState<string | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  )

  function scrollToBottom() {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setLoading(true)
      try {
        const { data: auth } = await supabase.auth.getUser()
        const uid = auth.user?.id ?? null
        if (!uid) {
          window.location.href = '/login'
          return
        }
        if (cancelled) return
        setUserId(uid)

        const { data: chanRows, error: chanErr } = await supabase
          .from('campus_channels')
          .select('id, slug, name, kind')
          .order('name', { ascending: true })

        if (chanErr) {
          setError(chanErr.message)
          setChannels([])
          return
        }

        const list = (chanRows || []) as Channel[]
        if (cancelled) return
        setChannels(list)
        setActiveChannelId(list[0]?.id ?? null)

        // Ensure membership for public channels in MVP.
        // If already a member, insert will conflict and be ignored by PK.
        for (const c of list) {
          await supabase.from('campus_channel_members').insert({ channel_id: c.id, user_id: uid }).catch(() => {})
        }
      } catch {
        setError('Failed to load Campus.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadMessages() {
      if (!activeChannelId) return
      setError(null)
      const { data, error } = await supabase
        .from('campus_messages')
        .select('id, channel_id, user_id, body, created_at')
        .eq('channel_id', activeChannelId)
        .order('created_at', { ascending: true })
        .limit(200)
      if (cancelled) return
      if (error) {
        setError(error.message)
        setMessages([])
        return
      }
      setMessages((data || []) as Message[])
      setTimeout(scrollToBottom, 50)
    }
    loadMessages()
    return () => {
      cancelled = true
    }
  }, [activeChannelId])

  useEffect(() => {
    if (!activeChannelId) return
    const channel = supabase
      .channel(`campus_messages:${activeChannelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'campus_messages', filter: `channel_id=eq.${activeChannelId}` },
        (payload) => {
          const m = payload.new as Message
          setMessages((prev) => [...prev, m])
          setTimeout(scrollToBottom, 30)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChannelId])

  async function send() {
    const body = draft.trim()
    if (!body || !userId || !activeChannelId) return
    setDraft('')
    const { error } = await supabase.from('campus_messages').insert({
      channel_id: activeChannelId,
      user_id: userId,
      body,
    })
    if (error) {
      setError(error.message)
      setDraft(body)
    }
  }

  if (loading) return <p className="text-[14px] text-gfa-muted">Loading Campus…</p>

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Card className="h-fit">
        <CardContent className="pt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Channels</p>
          <div className="mt-4 space-y-1">
            {channels.map((c) => {
              const active = c.id === activeChannelId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveChannelId(c.id)}
                  className={cn(
                    'w-full rounded-[10px] px-3 py-2 text-left text-[13px] transition-colors',
                    active ? 'bg-gfa-rose/40 text-gfa-fg-bright' : 'text-gfa-muted hover:bg-gfa-rose/25 hover:text-gfa-fg'
                  )}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-[12px] text-gfa-subtle">
            MVP: basic channels. DMs, cohorts, alumni, moderation, and “disable during presentations” are next.
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-[520px]">
        <CardContent className="flex h-full flex-col pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium text-gfa-fg-bright">{activeChannel?.name || 'Channel'}</p>
              <p className="mt-1 text-[12px] text-gfa-subtle">Be respectful. Academic discussion first.</p>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[10px] border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-300/90">
              {error}
            </div>
          ) : null}

          <div
            ref={listRef}
            className="mt-5 flex-1 overflow-auto rounded-[12px] border border-gfa-border bg-gfa-canvas/20 p-4"
          >
            {messages.length === 0 ? (
              <p className="text-[13px] text-gfa-muted">No messages yet.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => {
                  const mine = m.user_id === userId
                  return (
                    <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-[12px] px-3.5 py-2.5 text-[13px] leading-relaxed',
                          mine
                            ? 'bg-gfa-accent-muted text-gfa-fg border border-gfa-accent/25'
                            : 'bg-gfa-rose/30 text-gfa-fg border border-gfa-border'
                        )}
                      >
                        <p>{m.body}</p>
                        <p className="mt-1 text-[11px] text-gfa-subtle">
                          {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
            />
            <Button type="button" onClick={send} disabled={!draft.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

