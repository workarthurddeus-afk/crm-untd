'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

const DETERMINISTIC_HEIGHTS = [40, 65, 80, 50, 75, 60, 90, 70, 55, 45]

export function ICPPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-8 space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="mt-2 h-4 w-3/4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <Card className="p-5">
            <Skeleton className="h-3 w-40 mb-4" />
            <div className="flex items-end gap-1 h-32">
              {DETERMINISTIC_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-surface-elevated"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-1 h-px bg-border" />
            <Skeleton className="mt-3 h-3 w-24 ml-auto" />
          </Card>

          <div className="space-y-3">
            <Skeleton className="h-3 w-44" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-sm" />
                </div>
                <div className="mt-3 flex gap-3">
                  <Skeleton className="h-14 flex-1 rounded-md" />
                  <Skeleton className="h-14 flex-1 rounded-md" />
                </div>
                <Skeleton className="mt-3 h-10 w-full rounded-md" />
                <div className="mt-3 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <Skeleton className="h-full w-2/3 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-6">
          <Card className="p-5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-4/5" />
            <div className="mt-5 h-px bg-border-subtle" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-7 w-7 rounded-md" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="pl-9 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
            <div className="mt-5 h-px bg-border-subtle" />
            <Skeleton className="mt-5 h-16 w-full rounded-md" />
            <div className="mt-5 h-px bg-border-subtle" />
            <div className="mt-5 flex flex-wrap gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-16 rounded-sm" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
