'use client'

import { useState, type ReactNode } from 'react'
import { AlertTriangle, ArrowRight, CalendarDays, ChevronDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import {
  calendarTypeLabel,
  formatEventClock,
  formatShortDate,
  getCalendarColorTokens,
  isOverdueEvent,
} from '@/lib/utils/calendar-display'
import type { CalendarEvent } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

interface Props {
  upcoming: CalendarEvent[]
  overdue: CalendarEvent[]
  isLoading: boolean
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
  today: Date
}

interface RowProps {
  event: CalendarEvent
  selected: boolean
  isOverdueRow: boolean
  onSelect: () => void
  today: Date
}

interface CollapsibleSectionProps {
  title: string
  count: number
  icon: LucideIcon
  tone?: 'default' | 'danger'
  open: boolean
  onToggle: () => void
  children: ReactNode
}

function CollapsibleSection({
  title,
  count,
  icon: Icon,
  tone = 'default',
  open,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left',
          'transition-colors duration-fast hover:bg-surface-elevated/55',
          tone === 'danger' ? 'text-danger' : 'text-text-muted'
        )}
      >
        <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
          {title}
        </span>
        <span className="ml-auto font-mono text-[10px] tabular-nums opacity-75">
          {count}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-fast group-hover:opacity-100',
            open ? 'rotate-180' : 'rotate-0'
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-60'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Row({ event, selected, isOverdueRow, onSelect, today }: RowProps) {
  const tokens = getCalendarColorTokens(event.color)
  const completed = event.status === 'completed'
  const overdue = isOverdueRow || isOverdueEvent(event, today)
  const dateLabel = formatShortDate(event.startAt)
  const time = event.allDay ? 'Dia' : formatEventClock(event.startAt)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left',
        'transition-colors duration-fast',
        selected
          ? 'bg-primary/10 ring-1 ring-primary/30'
          : 'hover:bg-surface-elevated/60'
      )}
    >
      <span
        aria-hidden
        className={cn('h-7 w-[3px] shrink-0 rounded-full', overdue ? 'bg-danger/70' : tokens.rail)}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-xs font-medium',
            completed ? 'text-text-muted line-through' : 'text-text-secondary group-hover:text-text'
          )}
        >
          {event.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="font-mono tabular-nums">{dateLabel}</span>
          <span className="text-text-muted/60">·</span>
          <span className="font-mono tabular-nums">{time}</span>
          <span className="text-text-muted/60">·</span>
          <span className={cn('truncate', tokens.chipText)}>
            {calendarTypeLabel[event.type]}
          </span>
        </p>
      </div>
      <ArrowRight
        className={cn(
          'h-3 w-3 shrink-0 transition-opacity duration-fast',
          selected ? 'text-primary opacity-100' : 'text-text-muted opacity-0 group-hover:opacity-100'
        )}
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  )
}

function PanelSkeleton() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-2 py-2">
          <Skeleton className="h-7 w-[3px] rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="mt-1.5 h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function UpcomingEventsPanel({
  upcoming,
  overdue,
  isLoading,
  selectedEventId,
  onSelectEvent,
  today,
}: Props) {
  const [overdueCollapsed, setOverdueCollapsed] = useState(false)
  const [upcomingCollapsed, setUpcomingCollapsed] = useState(false)
  const overdueOpen = overdue.length > 0 && !overdueCollapsed
  const upcomingOpen = !upcomingCollapsed

  return (
    <section className="border-t border-border-subtle bg-background/40">
      <div className="flex flex-col gap-2.5 p-3">
        {overdue.length > 0 && (
          <CollapsibleSection
            title="Atrasados"
            count={overdue.length}
            icon={AlertTriangle}
            tone="danger"
            open={overdueOpen}
            onToggle={() => setOverdueCollapsed((value) => !value)}
          >
            <div className="space-y-0.5">
              {overdue.slice(0, 3).map((event) => (
                <Row
                  key={event.id}
                  event={event}
                  selected={event.id === selectedEventId}
                  isOverdueRow
                  onSelect={() => onSelectEvent(event.id)}
                  today={today}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection
          title="Próximos"
          count={upcoming.length}
          icon={CalendarDays}
          open={upcomingOpen}
          onToggle={() => setUpcomingCollapsed((value) => !value)}
        >
          {isLoading ? (
            <PanelSkeleton />
          ) : upcoming.length === 0 ? (
            <p className="rounded-md border border-border-subtle/70 bg-surface/25 px-3 py-2 text-[11px] text-text-muted">
              Sem eventos pendentes nos próximos dias.
            </p>
          ) : (
            <div className="space-y-0.5">
              {upcoming.slice(0, 5).map((event) => (
                <Row
                  key={event.id}
                  event={event}
                  selected={event.id === selectedEventId}
                  isOverdueRow={false}
                  onSelect={() => onSelectEvent(event.id)}
                  today={today}
                />
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </section>
  )
}
