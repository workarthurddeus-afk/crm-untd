import { cn } from '@/lib/utils/cn'

interface Props {
  label: string
  count: number
  tone?: 'danger'
}

export function TasksGroupHeader({ label, count, tone }: Props) {
  return (
    <div className="mt-8 mb-2 flex items-baseline justify-between">
      <span
        className={cn(
          'text-xs font-semibold uppercase tracking-wider',
          tone === 'danger' ? 'text-danger' : 'text-text-secondary',
        )}
      >
        {label}
      </span>
      <span className="font-mono tabular-nums text-xs text-text-muted">
        {count}
      </span>
    </div>
  )
}
