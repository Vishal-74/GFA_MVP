import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      aria-label="Loading"
      className={cn(
        'size-4 animate-spin rounded-full border-2 border-gfa-border border-t-gfa-accent/90',
        className
      )}
    />
  )
}

