import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

export function formatMoney(cents: number, currency: string): string {
  if (cents === 0) return 'Free'
  const cur = currency.length === 3 ? currency.toUpperCase() : 'EUR'
  return new Intl.NumberFormat(cur === 'USD' ? 'en-US' : 'en-IE', {
    style: 'currency',
    currency: cur,
  }).format(cents / 100)
}

/** Deterministic gradient classes for catalogue cards (no meaningless initials). */
const CATALOG_GRADIENTS = [
  'from-amber-950/40 via-[#1f1c18] to-gfa-canvas',
  'from-emerald-950/35 via-[#141a16] to-gfa-canvas',
  'from-amber-900/25 via-[#1a1814] to-gfa-canvas',
  'from-orange-950/30 via-[#1c1510] to-gfa-canvas',
  'from-stone-900/40 via-[#161412] to-gfa-canvas',
  'from-yellow-950/20 via-[#1a1810] to-gfa-canvas',
]

export function catalogGradientClass(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 31) >>> 0
  return CATALOG_GRADIENTS[h % CATALOG_GRADIENTS.length]
}

export function catalogEmoji(emoji: string | null | undefined): string {
  const e = emoji?.trim()
  return e && e.length > 0 ? e : '📘'
}
