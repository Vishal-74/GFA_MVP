import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        [
          'h-11 w-full rounded-[10px] border border-gfa-border bg-gfa-rose/30 px-4',
          'text-[14px] text-gfa-fg placeholder:text-gfa-subtle',
          'transition-[border-color,box-shadow,background-color] duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfa-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-gfa-canvas',
          'hover:border-gfa-border-strong',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ].join(' '),
        className
      )}
      {...props}
    />
  )
}

