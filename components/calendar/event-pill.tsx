'use client'

import { cn } from '@/lib/utils/cn'
import {
  formatEventClock,
  getCalendarColorTokens,
  isOverdueEvent,
} from '@/lib/utils/calendar-display'
import { Bell, Check, Flame, ListChecks } from 'lucide-react'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  event: CalendarEvent
  selected?: boolean
  onSelect: () => void
  today: Date
}

/**
 * Compact event pill rendered inside a day cell. Density-first: shows time +
 * truncated title, color rail at left, importance flame on the right when
 * critical. Completed events fade and get a strike-through to read at a
 * glance without consuming attention.
 */
export function EventPill({ event, selected = false, onSelect, today }: Props) {
  const tokens = getCalendarColorTokens(event.color)
  const completed = event.status === 'completed'
  const cancelled = event.status === 'cancelled'
  const overdue = isOverdueEvent(event, today)
  const time = event.allDay ? null : formatEventClock(event.startAt)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      className={cn(
        'group/pill relative flex w-full items-center gap-1 overflow-hidden rounded',
        'border px-1.5 py-0.5 text-left text-[10px] leading-tight',
        'transition-colors duration-fast',
        completed
          ? 'border-border-subtle bg-surface/40 text-text-muted line-through opacity-70'
          : cancelled
            ? 'border-dashed border-border-subtle bg-transparent text-text-muted/70'
            : cn(tokens.pillBg, tokens.pillText, tokens.pillBorder),
        selected && 'ring-1 ring-primary/40',
        'hover:brightness-110'
      )}
      aria-label={event.title}
    >
      {/* Color rail */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-[2px]',
          completed ? 'bg-text-muted/40' : tokens.rail
        )}
      />

      <span className="ml-1 flex min-w-0 flex-1 items-center gap-1">
        {event.isReminder && !completed && (
          <Bell className="h-2.5 w-2.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
        )}
        {event.relatedTaskId && (
          <ListChecks className="h-2.5 w-2.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
        )}
        {time && (
          <span className="font-mono text-[9px] tabular-nums opacity-80 shrink-0">{time}</span>
        )}
        <span className="truncate font-medium">{event.title}</span>
      </span>

      {completed ? (
        <Check className="h-2.5 w-2.5 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
      ) : event.importance === 'critical' ? (
        <Flame
          className={cn(
            'h-2.5 w-2.5 shrink-0',
            overdue ? 'text-danger' : 'text-warning'
          )}
          strokeWidth={2}
          aria-hidden
        />
      ) : overdue ? (
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
      ) : null}
    </button>
  )
}
