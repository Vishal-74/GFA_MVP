import Image from 'next/image'
import Link from 'next/link'
import { LOGO_HEIGHT_PX, LOGO_MAX_WIDTH_PX } from '@/lib/logo-dimensions'
import { cn } from '@/lib/utils'

/** Brand logo + home link (nav and marketing chrome). */
export default function GfaLogoLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Global Freedom Academy — Master College, home"
      className={cn(
        'group flex shrink-0 items-center leading-none outline-none transition-opacity duration-200 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-gfa-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-gfa-deep opacity-95',
        className
      )}
    >
      <Image
        src="/gfa-logo.png"
        alt=""
        width={5835}
        height={4167}
        priority
        style={{
          height: LOGO_HEIGHT_PX,
          maxHeight: LOGO_HEIGHT_PX,
          width: 'auto',
          maxWidth: LOGO_MAX_WIDTH_PX,
        }}
        className="block object-contain object-left transition-transform duration-200 group-hover:scale-[1.02]"
      />
    </Link>
  )
}
