'use client'

import { tryStaticTutorReply, type CourseChatContext } from '@/lib/ai-bot-static'
import { useState, useEffect, useRef, useCallback } from 'react'

export const TUTOR_QUICK_PROMPTS = [
  'Hi',
  'What is this course about?',
  'How long will this course take?',
  'Summarise module 1 for me',
  'Who is the lecturer?',
]

/** Coursera-style coach chips (sent as-is to the tutor). */
export const COACH_PROMPTS = [
  'Give me practice questions for this lesson',
  'Explain this topic in simple terms',
  'Give me a summary of this lesson',
  'Give me real-life examples related to this lesson',
]

export default function AiBot({
  courseId,
  courseContext,
  pendingAutoSend,
  onPendingAutoSendConsumed,
  variant = 'sidebar',
}: {
  courseId: string
  courseContext: CourseChatContext
  pendingAutoSend?: string | null
  onPendingAutoSendConsumed?: () => void
  variant?: 'sidebar' | 'inline'
}) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim()
      if (!trimmed) return

      setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
      setInput('')
      setLoading(true)

      const local = tryStaticTutorReply(trimmed, courseContext)
      if (local) {
        setMessages((prev) => [...prev, { role: 'assistant', content: local }])
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/ai-bot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmed, courseId }),
        })
        const { answer } = await res.json()
        setMessages((prev) => [...prev, { role: 'assistant', content: answer || 'No answer returned.' }])
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, something went wrong. Try again.' },
        ])
      }

      setLoading(false)
    },
    [courseId, courseContext]
  )

  const sendRef = useRef(sendMessage)
  useEffect(() => {
    sendRef.current = sendMessage
  }, [sendMessage])

  useEffect(() => {
    if (!pendingAutoSend?.trim()) return
    const text = pendingAutoSend.trim()
    let cancelled = false
    void (async () => {
      await sendRef.current(text)
      if (!cancelled) onPendingAutoSendConsumed?.()
    })()
    return () => {
      cancelled = true
    }
  }, [pendingAutoSend, onPendingAutoSendConsumed])

  const isInline = variant === 'inline'
  const border = 'border-gfa-border'
  const surface = isInline ? 'bg-gfa-rose/80' : 'bg-gfa-surface'
  const muted = isInline ? 'text-gfa-muted' : 'text-gfa-muted'
  const fg = isInline ? 'text-gfa-fg' : 'text-gfa-fg'
  const accentText = isInline ? 'text-gfa-accent-bright' : 'text-gfa-accent'

  return (
    <div id="ai-tutor" className={`flex h-full min-h-[320px] flex-col ${isInline ? 'rounded-2xl border border-gfa-border' : ''}`}>
      <div className={`border-b ${border} px-5 py-4 ${isInline ? 'bg-gfa-rose/50' : ''}`}>
        <p className={`text-[11px] font-medium uppercase tracking-[0.25em] ${accentText}`}>
          AI tutor
        </p>
        <p className={`mt-1 text-[15px] leading-snug ${muted}`}>
          Quick answers and material-grounded replies. Use the coach chips above or type below.
        </p>
      </div>

      <div className={`flex-1 space-y-4 overflow-y-auto px-5 py-5 ${isInline ? 'max-h-[min(50vh,420px)]' : ''}`}>
        {messages.length === 0 && (
          <div className="space-y-4 py-2">
            <div className={`text-center text-[15px] leading-relaxed ${muted}`}>
              Ask anything about this lesson or the course.
            </div>
            <div className="flex flex-wrap gap-2">
              {TUTOR_QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage(p)}
                  className={`rounded-full border px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-40 ${
                    isInline
                      ? 'border-gfa-border-strong bg-gfa-elevated/80 text-gfa-fg hover:border-gfa-accent/40 hover:bg-gfa-elevated'
                      : 'border-gfa-border bg-gfa-surface text-gfa-fg/90 hover:border-gfa-accent/40 hover:bg-gfa-accent-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                m.role === 'user'
                  ? isInline
                    ? 'bg-gfa-accent/90 text-gfa-on-accent'
                    : 'bg-gfa-accent text-gfa-on-accent'
                  : `${border} ${surface} ${fg}/90 border`
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`rounded-2xl border ${border} ${surface} px-4 py-3 text-[15px] ${muted}`}>
              <span className="inline-flex gap-1">
                <span className="animate-pulse">·</span>
                <span className="animate-pulse [animation-delay:150ms]">·</span>
                <span className="animate-pulse [animation-delay:300ms]">·</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={`border-t ${border} p-4 ${isInline ? 'bg-gfa-canvas/80' : ''}`}>
        <div className="flex gap-2">
          <input
            className={`min-w-0 flex-1 rounded-full border px-4 py-3 text-[15px] placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-gfa-accent/30 ${
              isInline
                ? 'border-gfa-border-strong bg-gfa-rose text-gfa-fg placeholder:text-gfa-subtle'
                : 'border-gfa-border bg-gfa-surface text-gfa-fg placeholder:text-gfa-subtle focus:border-gfa-accent/40 focus:ring-gfa-accent/20'
            }`}
            placeholder="Ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && void sendMessage(input)}
          />
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={loading || !input.trim()}
            className={`shrink-0 rounded-full px-6 py-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isInline
                ? 'bg-gfa-accent text-gfa-on-accent hover:bg-gfa-accent-bright'
                : 'bg-gfa-accent text-gfa-on-accent hover:bg-gfa-accent-bright'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
