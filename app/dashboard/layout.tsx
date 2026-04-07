import Navigation from '@/components/Navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { MAIN_CONTENT_TOP_OFFSET_PX } from '@/lib/logo-dimensions'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gfa-canvas text-gfa-fg">
      <Navigation />
      <div style={{ paddingTop: MAIN_CONTENT_TOP_OFFSET_PX }}>
        <div className="mx-auto flex w-full max-w-[1400px]">
          <DashboardSidebar />
          <div className="min-w-0 flex-1 px-6 pb-24 pt-8">
            <Breadcrumbs />
            <div className="mt-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
