'use client'

import type { KeyboardEvent } from 'react'
import { cn } from '@/lib/utils/cn'
import { isOverdueEvent } from '@/lib/utils/calendar-display'
import { EventPill } from './event-pill'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: CalendarEvent[]
  onSelectDay: () => void
  onSelectEvent: (eventId: string) => void
  selectedEventId: string | null
  today: Date
}

const VISIBLE_EVENT_LIMIT = 3

export function CalendarDayCell({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  events,
  onSelectDay,
  onSelectEvent,
  selectedEventId,
  today,
}: Props) {
  const visible = events.slice(0, VISIBLE_EVENT_LIMIT)
  const overflow = events.length - visible.length
  const hasOverdue = events.some((event) => isOverdueEvent(event, today))
  const hasCritical = events.some((event) => event.importance === 'critical')
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectDay()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelectDay}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      className={cn(
        'group relative flex h-full min-h-[120px] cursor-pointer flex-col gap-1.5 rounded-md border p-1.5 text-left',
        'transition-colors duration-fast',
        isCurrentMonth
          ? 'border-border-subtle bg-surface/40'
          : 'border-transparent bg-transparent',
        !isSelected && isCurrentMonth && 'hover:border-border hover:bg-surface-elevated/50',
        isSelected &&
          'border-primary/45 bg-primary/[0.06] shadow-[inset_0_0_0_1px_rgba(83,50,234,0.18)]',
        isToday && !isSelected && 'border-primary/30 bg-primary/[0.04]'
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-mono text-xs tabular-nums',
            isToday
              ? 'bg-primary text-white shadow-glow-primary-sm'
              : isCurrentMonth
                ? 'text-text-secondary group-hover:text-text'
                : 'text-text-muted/60'
          )}
        >
          {date.getUTCDate()}
        </span>

        <div className="flex items-center gap-1">
          {hasCritical && (
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warning" />
          )}
          {hasOverdue && (
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-danger" />
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-0.5">
        {visible.map((event) => (
          <EventPill
            key={event.id}
            event={event}
            selected={event.id === selectedEventId}
            onSelect={() => onSelectEvent(event.id)}
            today={today}
          />
        ))}
        {overflow > 0 && (
          <span className="mt-0.5 px-1 text-[10px] text-text-muted">
            +{overflow}{' '}
            {overflow === 1 ? 'evento' : 'eventos'}
          </span>
        )}
      </div>
    </div>
  )
}
