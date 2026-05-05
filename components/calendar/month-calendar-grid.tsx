'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/skeleton'
import { getDateKey, getStartOfMonth, getStartOfWeek } from '@/lib/utils/date-range'
import { groupEventsByDay } from '@/lib/utils/calendar'
import { CalendarDayCell } from './calendar-day-cell'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  /** Any date inside the month being rendered. */
  cursor: Date
  /** Today (UTC midnight resolved at the page level). */
  today: Date
  /** Currently selected day. */
  selectedDay: Date
  events: CalendarEvent[]
  onSelectDay: (date: Date) => void
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
  isLoading?: boolean
}

/**
 * Builds the 6×7 visible grid for a given month, anchored to the project's
 * Monday-start week (matching `getStartOfWeek`).
 */
function buildMonthGrid(cursor: Date): Date[] {
  const startOfMonth = getStartOfMonth(cursor)
  const start = getStartOfWeek(startOfMonth)
  return Array.from({ length: 42 }, (_, idx) => {
    return new Date(start.getTime() + idx * 86_400_000)
  })
}

const WEEKDAY_HEADERS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function GridSkeleton() {
  return (
    <div className="grid flex-1 grid-cols-7 gap-1.5">
      {Array.from({ length: 42 }).map((_, idx) => (
        <Skeleton key={idx} className="h-full min-h-[120px] w-full rounded-md" />
      ))}
    </div>
  )
}

export function MonthCalendarGrid({
  cursor,
  today,
  selectedDay,
  events,
  onSelectDay,
  selectedEventId,
  onSelectEvent,
  isLoading = false,
}: Props) {
  const days = useMemo(() => buildMonthGrid(cursor), [cursor])
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events])

  const cursorMonth = cursor.getUTCMonth()
  const todayKey = getDateKey(today)
  const selectedKey = getDateKey(selectedDay)

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="grid grid-cols-7 gap-1.5 px-1 pb-1">
        {WEEKDAY_HEADERS.map((label) => (
          <div
            key={label}
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted"
          >
            {label}
          </div>
        ))}
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : (
        <div
          className={cn(
            'grid flex-1 grid-cols-7 gap-1.5 auto-rows-fr',
            'rounded-lg border border-border-subtle bg-surface/30 p-1.5'
          )}
        >
          {days.map((date) => {
            const key = getDateKey(date)
            const isCurrentMonth = date.getUTCMonth() === cursorMonth
            const dayEvents = eventsByDay[key] ?? []
            return (
              <CalendarDayCell
                key={key}
                date={date}
                isCurrentMonth={isCurrentMonth}
                isToday={key === todayKey}
                isSelected={key === selectedKey}
                events={dayEvents}
                onSelectDay={() => onSelectDay(date)}
                selectedEventId={selectedEventId}
                onSelectEvent={onSelectEvent}
                today={today}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
