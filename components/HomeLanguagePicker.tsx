'use client'

import { useEffect, useState } from 'react'

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
] as const

const STORAGE_KEY = 'gfa-portal-locale'

export default function HomeLanguagePicker() {
  const [active, setActive] = useState<string>(() => {
    if (typeof window === 'undefined') return 'en'
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved && LOCALES.some((l) => l.code === saved) ? saved : 'en'
  })

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = active
  }, [active])

  function select(code: string) {
    setActive(code)
    localStorage.setItem(STORAGE_KEY, code)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gfa-subtle">Language selection</p>
      <div className="flex flex-wrap justify-center gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => select(l.code)}
            className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
              active === l.code
                ? 'border-gfa-accent bg-gfa-accent text-gfa-on-accent'
                : 'border-gfa-border bg-gfa-rose/50 text-gfa-muted hover:border-gfa-accent/40 hover:text-gfa-fg'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <p className="max-w-md text-center text-[12px] text-gfa-subtle">
        UI copy is primarily English today; this sets your portal preference for upcoming localisation.
      </p>
    </div>
  )
}
