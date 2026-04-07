import * as React from 'react'
import { cn } from '@/lib/utils'

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10', className)}
      {...props}
    />
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 pb-8 pt-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 font-display text-3xl font-normal tracking-tight text-gfa-fg-bright sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 w-full max-w-none text-[15px] leading-relaxed text-gfa-muted sm:text-[16px]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

