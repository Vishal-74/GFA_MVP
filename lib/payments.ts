/**
 * Simulated checkout is default (PDF / plan). Stripe when NEXT_PUBLIC_PAYMENTS_PROVIDER=stripe
 * and Stripe keys are configured.
 */
export type PaymentsProvider = 'simulated' | 'stripe'

export function getPaymentsProvider(): PaymentsProvider {
  const v = process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER?.trim().toLowerCase()
  if (v === 'stripe') return 'stripe'
  return 'simulated'
}

export function useStripeCheckout(): boolean {
  return getPaymentsProvider() === 'stripe'
}
