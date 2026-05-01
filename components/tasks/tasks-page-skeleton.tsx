import { Skeleton } from '@/components/ui/skeleton'

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-3 px-4 -mx-4">
      <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-16 rounded-sm" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>
      </div>
    </div>
  )
}

function SkeletonGroup({ count }: { count: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mt-8 mb-2">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-4 rounded" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

export function TasksPageSkeleton() {
  return (
    <div className="px-8 py-6">
      <SkeletonGroup count={2} />
      <SkeletonGroup count={3} />
      <SkeletonGroup count={2} />
    </div>
  )
}
