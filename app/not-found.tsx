import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gfa-canvas px-6 text-gfa-fg">
      <p className="font-display text-7xl text-gfa-accent/80 md:text-8xl">404</p>
      <h1 className="mt-6 font-display text-2xl font-normal md:text-3xl">This page is not here</h1>
      <p className="mt-4 max-w-sm text-center text-[15px] text-gfa-muted">
        The link may be wrong, or the page was moved.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full border border-gfa-border px-8 py-3 text-sm font-medium tracking-wide text-gfa-fg transition-colors hover:border-gfa-accent/40 hover:bg-gfa-surface"
      >
        Home
      </Link>
    </div>
  )
}
