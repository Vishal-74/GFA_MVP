import Navigation from '@/components/Navigation'
import { Container } from '@/components/ui/container'
import { MAIN_CONTENT_TOP_OFFSET_PX } from '@/lib/logo-dimensions'
import { cn } from '@/lib/utils'

type PublicShellProps = {
  children: React.ReactNode
  /** Extra classes on the outer wrapper (e.g. `relative min-h-[100dvh]` for home hero). */
  className?: string
  /** Extra classes on `<main>`. */
  mainClassName?: string
  /** Render children without `Container` (home hero + manual `Container` inside). */
  noContainer?: boolean
  /** When using `noContainer`, set to false to skip bottom padding on main. */
  containerClassName?: string
}

/**
 * Standard public page: fixed nav + consistent horizontal margins via `Container` (max-w-[1400px], responsive px).
 */
export function PublicShell({
  children,
  className,
  mainClassName,
  noContainer,
  containerClassName,
}: PublicShellProps) {
  return (
    <div className={cn('min-h-screen bg-gfa-canvas text-gfa-fg', className)}>
      <Navigation />
      <main
        className={cn(mainClassName)}
        style={{ paddingTop: MAIN_CONTENT_TOP_OFFSET_PX }}
      >
        {noContainer ? children : <Container className={cn('pt-6 pb-24', containerClassName)}>{children}</Container>}
      </main>
    </div>
  )
}
