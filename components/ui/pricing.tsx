'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CheckCircle, Star } from 'lucide-react'
import { motion, type Transition } from 'framer-motion'

export type FeeMode = 'unit' | 'example'
const feeModes: FeeMode[] = ['unit', 'example']

export interface Plan {
  name: string
  info: string
  display: { unit: string; example: string }
  priceCaption: { unit: string; example: string }
  features: { text: string; tooltip?: string }[]
  btn: { text: string; href: string }
  highlighted?: boolean
}

interface PricingSectionProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  plans: Plan[]
  /** If omitted, no title/description block is rendered (use with `PageHeader` above). */
  heading?: string
  description?: string
}

export function PricingSection({ plans, heading, description, className, ...props }: PricingSectionProps) {
  const [feeMode, setFeeMode] = React.useState<FeeMode>('unit')
  const showIntro = Boolean(heading || description)

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn('flex w-full flex-col items-center justify-center p-0', showIntro ? 'space-y-6' : 'space-y-5', className)}
        {...props}
      >
        {showIntro ? (
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            {heading ? (
              <h2 className="font-display text-2xl font-normal tracking-tight text-gfa-fg-bright md:text-3xl lg:text-[2rem]">
                {heading}
              </h2>
            ) : null}
            {description ? (
              <p className="text-[15px] leading-relaxed text-gfa-muted md:text-base">{description}</p>
            ) : null}
          </div>
        ) : null}

        <PricingFeeModeToggle feeMode={feeMode} setFeeMode={setFeeMode} />

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} feeMode={feeMode} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

type PricingFeeModeToggleProps = React.ComponentProps<'div'> & {
  feeMode: FeeMode
  setFeeMode: React.Dispatch<React.SetStateAction<FeeMode>>
}

export function PricingFeeModeToggle({ feeMode, setFeeMode, className, ...props }: PricingFeeModeToggleProps) {
  const label = (m: FeeMode) => (m === 'unit' ? 'Unit fees' : 'Examples')

  return (
    <div
      className={cn(
        'relative mx-auto flex w-fit rounded-full border border-gfa-border bg-gfa-rose/40 p-1 shadow-inner shadow-black/20 transition-[border-color,box-shadow] duration-300 hover:border-gfa-accent/30 hover:shadow-[0_0_24px_-8px_rgba(59,130,246,0.2)]',
        className
      )}
      {...props}
    >
      {feeModes.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setFeeMode(mode)}
          className="relative px-4 py-1.5 text-[13px] font-medium capitalize text-gfa-muted transition-colors hover:text-gfa-fg-bright"
        >
          <span className="relative z-10">{label(mode)}</span>
          {feeMode === mode ? (
            <motion.span
              layoutId="gfa-fee-mode"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute inset-0 z-0 rounded-full bg-gfa-accent-muted ring-1 ring-gfa-accent/35"
            />
          ) : null}
        </button>
      ))}
    </div>
  )
}

type PricingCardProps = React.ComponentProps<'div'> & {
  plan: Plan
  feeMode?: FeeMode
}

export function PricingCard({ plan, className, feeMode = 'unit', ...props }: PricingCardProps) {
  const amount = feeMode === 'unit' ? plan.display.unit : plan.display.example
  const caption = feeMode === 'unit' ? plan.priceCaption.unit : plan.priceCaption.example

  return (
    <div
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-xl border border-gfa-border bg-gfa-rose/20 shadow-sm shadow-black/20',
        'transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out will-change-transform',
        'hover:-translate-y-1 hover:border-gfa-accent/45 hover:bg-gfa-rose/40 hover:shadow-[0_20px_56px_-32px_rgba(59,130,246,0.45)]',
        'hover:ring-1 hover:ring-gfa-accent/20',
        plan.highlighted &&
          'border-gfa-accent/35 bg-gfa-rose/30 ring-1 ring-gfa-accent/20 hover:border-gfa-accent/55 hover:bg-gfa-rose/45 hover:shadow-[0_24px_64px_-28px_rgba(96,165,250,0.5)]',
        className
      )}
      {...props}
    >
      {plan.highlighted ? (
        <BorderTrail
          size={72}
          className="bg-gfa-accent-bright/90"
          style={{
            boxShadow:
              '0 0 40px 12px rgba(96, 165, 250, 0.25), 0 0 80px 24px rgba(59, 130, 246, 0.12)',
          }}
        />
      ) : null}

      <div
        className={cn(
          'relative rounded-t-xl border-b border-gfa-border p-4 transition-[background-color] duration-300',
          plan.highlighted
            ? 'bg-gfa-accent-muted/30 group-hover:bg-gfa-accent-muted/45'
            : 'bg-gfa-rose/25 group-hover:bg-gfa-rose/40'
        )}
      >
        <div className="absolute right-2 top-2 z-10 flex flex-wrap items-center justify-end gap-2">
          {plan.highlighted ? (
            <p className="flex items-center gap-1 rounded-md border border-gfa-border bg-gfa-canvas/80 px-2 py-0.5 text-[11px] font-medium text-gfa-fg-bright">
              <Star className="h-3 w-3 fill-gfa-accent-bright text-gfa-accent-bright" aria-hidden />
              Popular
            </p>
          ) : null}
          {feeMode === 'example' ? (
            <p className="rounded-md border border-gfa-accent/30 bg-gfa-accent-muted/50 px-2 py-0.5 text-[11px] font-medium text-gfa-accent-bright">
              Illustrative
            </p>
          ) : null}
        </div>

        <div className="pr-16 text-base font-medium text-gfa-fg-bright transition-colors duration-300 group-hover:text-gfa-accent-bright">
          {plan.name}
        </div>
        <p className="mt-1 text-sm leading-snug text-gfa-muted transition-colors duration-300 group-hover:text-gfa-fg/85">
          {plan.info}
        </p>
        <h3 className="mt-3 flex flex-wrap items-end gap-1.5">
          <span className="font-display text-3xl font-normal tabular-nums text-gfa-fg-bright transition-colors duration-300 group-hover:text-gfa-fg-bright">
            {amount}
          </span>
          <span className="pb-0.5 text-sm text-gfa-subtle transition-colors duration-300 group-hover:text-gfa-muted">
            {caption}
          </span>
        </h3>
      </div>

      <div
        className={cn(
          'space-y-3 px-4 py-5 text-sm text-gfa-muted transition-[background-color] duration-300 group-hover:bg-white/[0.03]',
          plan.highlighted && 'bg-gfa-canvas/10 group-hover:bg-gfa-canvas/15'
        )}
      >
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2.5">
            <CheckCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-gfa-accent-bright transition-[color,transform] duration-300 group-hover:scale-105 group-hover:text-gfa-accent-soft"
              aria-hidden
            />
            {feature.tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="cursor-help border-b border-dashed border-gfa-border-strong text-left leading-snug">
                    {feature.text}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-gfa-muted">{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <p className="text-left leading-snug">{feature.text}</p>
            )}
          </div>
        ))}
      </div>

      <div
        className={cn(
          'mt-auto w-full border-t border-gfa-border p-3 transition-[background-color] duration-300',
          plan.highlighted ? 'bg-gfa-accent-muted/20 group-hover:bg-gfa-accent-muted/35' : 'group-hover:bg-gfa-rose/20'
        )}
      >
        <Button
          className="w-full transition-[transform,box-shadow] duration-300 group-hover:shadow-md group-hover:shadow-gfa-accent/15"
          variant={plan.highlighted ? 'primary' : 'secondary'}
          asChild
        >
          <Link href={plan.btn.href}>{plan.btn.text}</Link>
        </Button>
      </div>
    </div>
  )
}

type BorderTrailProps = {
  className?: string
  size?: number
  transition?: Transition
  delay?: number
  onAnimationComplete?: () => void
  style?: React.CSSProperties
}

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const BASE_TRANSITION: Transition = {
    repeat: Infinity,
    duration: 5,
    ease: 'linear',
  }

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn('absolute aspect-square rounded-full', className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={{
          ...(transition ?? BASE_TRANSITION),
          delay,
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  )
}
