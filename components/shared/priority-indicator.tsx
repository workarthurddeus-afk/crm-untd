import { cn } from '@/lib/utils/cn'
import type { TaskImportance } from '@/lib/types'

const map: Record<TaskImportance, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-text-muted' },
  medium: { label: 'Média', color: 'bg-warning' },
  high: { label: 'Alta', color: 'bg-primary' },
}

interface Props {
  value: TaskImportance
  showLabel?: boolean
  className?: string
}

export function PriorityIndicator({
  value,
  showLabel = false,
  className,
}: Props) {
  const { label, color } = map[value]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-text-secondary',
        className
      )}
    >
      <span
        aria-hidden
        className={cn('h-2 w-2 rounded-full', color)}
      />
      {showLabel && <span>{label}</span>}
      <span className="sr-only">Prioridade {label}</span>
    </span>
  )
}
