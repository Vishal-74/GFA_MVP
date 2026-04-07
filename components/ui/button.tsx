import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[10px]',
    'text-[13px] font-medium tracking-wide',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfa-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gfa-canvas',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-gfa-accent text-gfa-on-accent hover:bg-gfa-accent-bright shadow-sm shadow-black/10',
        secondary:
          'border border-gfa-border bg-gfa-rose/40 text-gfa-fg hover:border-gfa-border-strong hover:bg-gfa-rose/60',
        ghost: 'text-gfa-fg hover:bg-gfa-rose/50',
        destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-black/10',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-[14px]',
        pill: 'h-11 rounded-full px-6 text-[14px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

