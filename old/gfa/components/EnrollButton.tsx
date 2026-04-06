'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getPaymentsProvider } from '@/lib/payments'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function EnrollButton({
  courseId,
  courseSlug,
  courseTitle,
  priceCents,
}: {
  courseId: string
  courseSlug: string
  courseTitle: string
  priceCents: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleEnroll() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (enrollment) {
      router.push(`/courses/${courseSlug}/learn`)
      return
    }

    const { data: access } = await supabase
      .from('lecture_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (access) {
      router.push(`/courses/${courseSlug}/learn`)
      return
    }

    try {
      if (priceCents === 0) {
        const response = await fetch('/api/enroll-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        })
        const body = await response.json()
        if (!response.ok || body.error) {
          alert(body.error || 'Could not enroll. Try signing in again.')
          setLoading(false)
          return
        }
        router.push(`/courses/${courseSlug}/learn`)
        return
      }

      if (getPaymentsProvider() === 'stripe') {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            courseSlug,
            courseTitle,
            priceInCents: priceCents,
            userId: user.id,
            userEmail: user.email ?? undefined,
          }),
        })

        const { url, error } = await response.json()

        if (error || !url) {
          alert(error || 'Failed to create checkout session. Try simulated payments or check Stripe configuration.')
          setLoading(false)
          return
        }

        window.location.href = url
        return
      }

      const response = await fetch('/api/checkout-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'lecture_series', courseId }),
      })
      const body = await response.json()
      if (!response.ok || body.error) {
        alert(body.error || 'Could not complete simulated purchase.')
        setLoading(false)
        return
      }
      router.push(`/courses/${courseSlug}/learn`)
    } catch {
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const label =
    priceCents === 0
      ? 'Enroll free'
      : getPaymentsProvider() === 'stripe'
        ? 'Enroll now'
        : 'Purchase lecture series (simulated)'

  return (
    <Button
      type="button"
      onClick={handleEnroll}
      disabled={loading}
      size="pill"
      className="w-full"
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Spinner />
          Loading…
        </>
      ) : (
        label
      )}
    </Button>
  )
}
