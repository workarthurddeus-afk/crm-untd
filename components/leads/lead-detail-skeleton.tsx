import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LeadDetailSkeleton() {
  return (
    <div className="px-8 py-6">
      <Skeleton className="mb-4 h-4 w-32" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6 min-w-0">
          {/* Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="mt-1 flex gap-1.5">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <Skeleton className="h-[72px] w-[72px] rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-40" />
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs row */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 border-b border-border pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Card key={i} className="p-5">
                  <Skeleton className="mb-4 h-4 w-24" />
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="p-5">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="mb-2 h-5 w-40" />
            <Skeleton className="mb-4 h-12 w-full" />
            <Skeleton className="h-9 w-full" />
          </Card>
          <Card className="p-5">
            <Skeleton className="mb-3 h-4 w-20" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
