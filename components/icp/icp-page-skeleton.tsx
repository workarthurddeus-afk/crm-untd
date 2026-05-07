'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const BAR_HEIGHTS = [18, 28, 46, 64, 52, 72, 88, 58, 36, 24]

export function ICPPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.55fr)] xl:items-start">
        <Card className="overflow-hidden border-primary/20">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="p-5 sm:p-6 lg:p-7">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-5 h-8 w-4/5" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-md border border-border-subtle bg-background/30 p-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-3 h-7 w-16" />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border-subtle p-5 sm:p-6 lg:border-l lg:border-t-0">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-6 w-40" />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-2 h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-6 w-44" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-5/6" />
          <Skeleton className="mt-5 h-24 w-full rounded-lg" />
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.42fr)] xl:items-start">
        <div>
          <Skeleton className="h-3 w-36" />
          <Skeleton className="mt-2 h-6 w-64" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div>
                      <Skeleton className="h-5 w-52" />
                      <Skeleton className="mt-2 h-3 w-80 max-w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-24 rounded-md" />
                </div>
                <Skeleton className="mt-4 h-20 w-full rounded-md" />
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-5 sm:p-6">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-2 h-4 w-full" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
          <div className="mt-5 flex h-36 items-end gap-1.5">
            {BAR_HEIGHTS.map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-surface-elevated"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
