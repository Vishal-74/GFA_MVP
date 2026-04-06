import { PublicShell } from '@/components/PublicShell'
import { PageHeader } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { GFA_INSTITUTION } from '@/lib/gfa-brand'
import { siteCopy } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default function FaqPage() {
  const f = siteCopy.faq

  return (
    <PublicShell>
      <div>
        <PageHeader eyebrow={GFA_INSTITUTION} title={f.title} description={f.description} />

        <div className="grid gap-4">
          {f.items.map((item) => (
            <Card key={item.q}>
              <CardContent className="pt-6">
                <p className="text-[15px] font-medium text-gfa-fg-bright">
                  <span className="mr-2 font-semibold text-gfa-accent-bright">Que.</span>
                  {item.q}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-gfa-muted">
                  <span className="mr-2 font-semibold text-gfa-subtle">Ans.</span>
                  {item.a}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicShell>
  )
}
