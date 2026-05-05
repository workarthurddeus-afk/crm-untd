import { Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  calendarImportanceLabel,
  importanceBadgeVariant,
} from '@/lib/utils/calendar-display'
import type { CalendarImportance } from '@/lib/types'

interface Props {
  importance: CalendarImportance
  className?: string
  compact?: boolean
}

export function ImportanceBadge({ importance, className, compact = false }: Props) {
  const variant = importanceBadgeVariant(importance)
  const label = calendarImportanceLabel[importance]
  return (
    <Badge variant={variant} className={className}>
      {importance === 'critical' && <Flame className="h-3 w-3" strokeWidth={1.75} aria-hidden />}
      {compact ? label : `Importância ${label.toLowerCase()}`}
    </Badge>
  )
}
