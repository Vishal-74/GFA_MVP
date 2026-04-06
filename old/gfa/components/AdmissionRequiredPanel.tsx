import type { ReactNode } from 'react'
import Link from 'next/link'
import SimulatedAdmissionButton from '@/components/SimulatedAdmissionButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdmissionRequiredPanel({
  title = 'Admission required',
  children,
}: {
  title?: string
  children?: ReactNode
}) {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <CardHeader>
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gfa-subtle">Master College</p>
        <CardTitle className="mt-3 font-display text-2xl font-normal">{title}</CardTitle>
        <CardDescription className="text-[14px]">
          {children ||
            'The one-time admission fee unlocks the digital library, Campus messenger, office hours, and all examination procedures (per academy policy).'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mt-2 flex flex-col items-center gap-3">
          <SimulatedAdmissionButton />
          <Button asChild variant="ghost" className="h-9 px-2">
            <Link href="/dashboard">Dashboard →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
