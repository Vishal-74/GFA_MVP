'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  /** Optional brand mark; if omitted, a small GFA mark is shown */
  logoUrl?: string
  title: string
  description: string
  /** Small floating label (e.g. programme kind). */
  price: string
  /** Shown in a bar at the bottom (e.g. `4 sem · 8 series`). */
  footerStats?: string
}

export function InteractiveProductCard({
  className,
  imageUrl,
  logoUrl,
  title,
  description,
  price,
  footerStats,
  ...props
}: InteractiveProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({ transformStyle: 'preserve-3d' })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    const rotateX = ((y - height / 2) / (height / 2)) * -8
    const rotateY = ((x - width / 2) / (width / 2)) * 8

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'transform 0.1s ease-out',
      transformStyle: 'preserve-3d' as const,
    })
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-in-out',
      transformStyle: 'preserve-3d' as const,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn(
        'group relative aspect-[9/12] w-full max-w-[340px] rounded-3xl border border-gfa-border/60 bg-gfa-rose/30 shadow-lg shadow-black/25',
        className
      )}
      {...props}
    >
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full rounded-3xl object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.06]"
        style={{ transform: 'translateZ(-20px) scale(1.08)' }}
        loading="lazy"
      />
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div
        className="absolute inset-0 flex flex-col p-5"
        style={{ transform: 'translateZ(40px)' }}
      >
        <div className="flex items-start justify-between gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
          <div className="min-w-0 flex-1 flex-col">
            <h3 className="text-xl font-bold leading-snug tracking-tight text-white">{title}</h3>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-white/75">{description}</p>
          </div>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-5 w-auto shrink-0 opacity-95" loading="lazy" />
          ) : (
            <span
              className="shrink-0 rounded-md border border-white/20 bg-black/25 px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-white/90"
              aria-hidden
            >
              GFA
            </span>
          )}
        </div>

        <div className="absolute left-5 top-[108px]">
          <div className="rounded-full bg-black/45 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            {price}
          </div>
        </div>

        <div className="mt-auto flex w-full flex-col items-center gap-3 pb-1">
          {footerStats ? (
            <div className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-center text-[13px] font-semibold tracking-wide text-white/95 backdrop-blur-md">
              {footerStats}
            </div>
          ) : null}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={cn('h-1.5 w-1.5 rounded-full', index === 0 ? 'bg-white' : 'bg-white/30')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
