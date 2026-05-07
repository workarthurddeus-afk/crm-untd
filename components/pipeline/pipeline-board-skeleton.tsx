'use client'

import { Skeleton } from '@/components/ui/skeleton'

function ColumnSkeleton() {
  return (
    <div className="flex flex-col bg-surface-elevated/50 rounded-lg border border-border w-[min(76vw,280px)] sm:w-[280px] shrink-0">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-6" />
        </div>
        <Skeleton className="mt-1.5 h-2.5 w-16" />
      </div>
      <div className="mx-3 h-px bg-border" />
      <div className="px-2 py-2 space-y-2">
        <Skeleton className="h-[88px] w-full rounded-md" />
        <Skeleton className="h-[88px] w-full rounded-md" />
        <Skeleton className="h-[88px] w-full rounded-md" />
      </div>
    </div>
  )
}

export function PipelineBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <ColumnSkeleton key={i} />
      ))}
    </div>
  )
}
