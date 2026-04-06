import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
}: {
  title: string
  body?: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <Card className="gfa-muted-shadow">
      <CardContent className="py-14 text-center">
        <p className="font-display text-[20px] text-gfa-fg-bright">{title}</p>
        {body ? <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-gfa-muted">{body}</p> : null}
        {actionLabel && actionHref ? (
          <div className="mt-6 flex justify-center">
            <Button asChild size="pill" variant="secondary">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

