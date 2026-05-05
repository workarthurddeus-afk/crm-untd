import { Badge } from '@/components/ui/badge'
import {
  calendarStatusLabel,
  statusBadgeVariant,
} from '@/lib/utils/calendar-display'
import type { CalendarEventStatus } from '@/lib/types'

interface Props {
  status: CalendarEventStatus
  className?: string
}

export function EventStatusBadge({ status, className }: Props) {
  return (
    <Badge variant={statusBadgeVariant(status)} className={className}>
      {calendarStatusLabel[status]}
    </Badge>
  )
}
