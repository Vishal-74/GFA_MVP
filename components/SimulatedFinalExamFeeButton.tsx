'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function SimulatedFinalExamFeeButton({
  level,
  className = '',
  onSuccess,
}: {
  level: 'bachelor' | 'master'
  className?: string
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function pay() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'final_exam', level }),
      })
      const body = await res.json()
      if (!res.ok || body.error) {
        alert(body.error || 'Could not complete payment.')
        return
      }
      onSuccess?.()
      if (!body.already) window.location.reload()
    } catch {
      alert('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={pay}
      disabled={loading}
      size="pill"
      variant="secondary"
      className={className}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Spinner />
          Processing…
        </>
      ) : (
        `Pay programme final examination (${level === 'master' ? 'Master' : 'Bachelor'}, simulated)`
      )}
    </Button>
  )
}
