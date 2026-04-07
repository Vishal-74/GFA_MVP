import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-gfa-border bg-gfa-rose/30 px-2.5 py-1 text-[11px] font-medium tracking-wide text-gfa-muted',
  {
    variants: {
      variant: {
        default: '',
        accent: 'border-gfa-accent/25 bg-gfa-accent-muted text-gfa-fg',
        success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100/90',
        warning: 'border-amber-500/25 bg-amber-500/10 text-amber-100/90',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

