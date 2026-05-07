import { Skeleton } from '@/components/ui/skeleton'

const HEADERS = [
  { label: 'Lead', width: 'w-16' },
  { label: 'Nicho', width: 'w-20' },
  { label: 'Origem', width: 'w-16' },
  { label: 'Etapa', width: 'w-14' },
  { label: 'Temp', width: 'w-12' },
  { label: 'ICP', width: 'w-10' },
  { label: 'Próx. follow-up', width: 'w-28' },
  { label: 'Último', width: 'w-14' },
] as const

const ROWS = 8

export function LeadsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm-token">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="bg-surface-elevated/80">
            <tr>
              {HEADERS.map((header) => (
                <th
                  key={header.label}
                  className="border-b border-border px-4 py-3 text-left"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    {header.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, i) => (
              <tr key={i}>
                {/* Lead */}
                <td className="border-b border-border-subtle px-4 py-3 align-middle">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2.5 w-24 opacity-60" />
                  </div>
                </td>
                {/* Niche */}
                <td className="border-b border-border-subtle px-4 py-3 align-middle">
                  <Skeleton className="h-3 w-28" />
                </td>
                {/* Origin */}
                <td className="border-b border-border-subtle px-4 py-3 align-middle">
                  <Skeleton className="h-5 w-20 rounded-sm" />
                </td>
                {/* Stage */}
                <td className="border-b border-border-subtle px-4 py-3 align-middle">
                  <Skeleton className="h-5 w-24 rounded-sm" />
                </td>
                {/* Temp */}
                <td className="border-b border-border-subtle px-4 py-3 align-middle">
                  <Skeleton className="h-5 w-16 rounded-sm" />
                </td>
                {/* ICP */}
                <td className="border-b border-border-subtle px-4 py-3 align-middle">
                  <Skeleton className="h-9 w-9 rounded-full" />
                </td>
                {/* Next follow-up */}
                <td className="border-b border-border-subtle px-4 py-3 align-middle">
                  <Skeleton className="h-3.5 w-16" />
                </td>
                {/* Last contact */}
                <td className="border-b border-border-subtle px-4 py-3 align-middle">
                  <Skeleton className="h-3.5 w-12" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
