import { Skeleton } from '@/components/ui/skeleton'

function SkeletonRow() {
  return (
    <div className="-mx-1 flex items-start gap-2 rounded-lg py-3 pl-1 pr-3 sm:gap-3 sm:px-3">
      <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
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
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonGroup count={2} />
      <SkeletonGroup count={3} />
      <SkeletonGroup count={2} />
    </div>
  )
}
