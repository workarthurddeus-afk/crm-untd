import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <Skeleton className="h-6 w-72 mb-8" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[124px]" />
        <Skeleton className="h-[124px]" />
        <Skeleton className="h-[124px]" />
        <Skeleton className="h-[124px]" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <Skeleton className="h-4 w-16 mb-3" />
          <Skeleton className="h-[72px]" />
          <Skeleton className="h-[72px]" />
          <Skeleton className="h-[72px]" />
          <Skeleton className="h-[72px]" />
        </div>
        <Skeleton className="h-[420px]" />
      </div>
    </div>
  )
}
