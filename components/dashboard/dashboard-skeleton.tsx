import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[124px] rounded-lg" />)}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-[420px] rounded-lg" />
        <div className="space-y-6">
          <Skeleton className="h-[180px] rounded-lg" />
          <Skeleton className="h-[260px] rounded-lg" />
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[100px] rounded-lg" />)}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-[220px] rounded-lg" />
        <Skeleton className="h-[220px] rounded-lg" />
      </div>
    </div>
  )
}
