'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  Link2,
  ListChecks,
  MapPin,
  StickyNote,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import {
  calendarTypeLabel,
  formatEventTimeRange,
  getCalendarColorTokens,
  importanceBadgeVariant,
  isOverdueEvent,
} from '@/lib/utils/calendar-display'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  event: CalendarEvent
  selected: boolean
  onSelect: () => void
  onComplete: () => Promise<void> | void
  onUncomplete: () => Promise<void> | void
  onCancel: () => Promise<void> | void
  today: Date
}

export function DayAgendaItem({
  event,
  selected,
  onSelect,
  onComplete,
  onUncomplete,
  onCancel,
  today,
}: Props) {
  const tokens = getCalendarColorTokens(event.color)
  const completed = event.status === 'completed'
  const cancelled = event.status === 'cancelled'
  const overdue = !completed && !cancelled && isOverdueEvent(event, today)
  const [busy, setBusy] = useState(false)

  const guard = async (fn: () => Promise<void> | void) => {
    if (busy) return
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border bg-surface/60 px-3 py-2.5',
        'transition-colors duration-fast',
        'before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-[2px] before:rounded-full',
        completed
          ? 'border-border-subtle opacity-60 before:bg-success/60'
          : cancelled
            ? 'border-dashed border-border-subtle opacity-50 before:bg-text-muted/40'
            : selected
              ? 'border-primary/40 bg-surface-elevated/85 shadow-[0_0_0_1px_rgba(83,50,234,0.18)]'
              : cn('border-border-subtle hover:border-border hover:bg-surface-elevated/60'),
        !completed && !cancelled && `before:${tokens.rail}`
      )}
    >
      <div className="relative flex items-start gap-3 pl-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            void guard(completed ? onUncomplete : onComplete)
          }}
          aria-label={completed ? 'Marcar como pendente' : 'Concluir evento'}
          disabled={busy}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            'transition-colors duration-fast',
            completed
              ? 'border-success bg-success text-white'
              : 'border-border bg-transparent text-transparent hover:border-success/60 hover:text-success/40'
          )}
        >
          {completed ? (
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
          ) : (
            <Circle className="h-3 w-3 opacity-0 group-hover:opacity-100" strokeWidth={2} aria-hidden />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-[11px] tabular-nums text-text-muted">
              {formatEventTimeRange(event)}
            </span>
            {event.isReminder && (
              <Bell className="h-3 w-3 text-warning" strokeWidth={1.75} aria-hidden />
            )}
            {overdue && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-danger">
                atrasado
              </span>
            )}
          </div>

          <h4
            className={cn(
              'mt-0.5 font-display text-sm font-semibold leading-snug',
              completed && 'line-through text-text-muted',
              cancelled && 'line-through text-text-muted'
            )}
          >
            {event.title}
          </h4>

          {event.description && !completed && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary/85">
              {event.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium',
                tokens.chipBg,
                tokens.chipText
              )}
            >
              {calendarTypeLabel[event.type]}
            </span>
            {(event.importance === 'critical' || event.importance === 'high') && (
              <Badge variant={importanceBadgeVariant(event.importance)} className="text-[10px]">
                {event.importance === 'critical' ? 'crítico' : 'alta'}
              </Badge>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                <MapPin className="h-2.5 w-2.5" strokeWidth={1.75} aria-hidden />
                <span className="max-w-[160px] truncate">{event.location}</span>
              </span>
            )}
            {event.meetingUrl && (
              <Link
                href={event.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] text-info underline-offset-2 hover:underline"
              >
                <ExternalLink className="h-2.5 w-2.5" strokeWidth={1.75} aria-hidden />
                meet
              </Link>
            )}
            {event.relatedLeadId && (
              <Link
                href={`/leads/${event.relatedLeadId}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-primary"
              >
                <Link2 className="h-2.5 w-2.5" strokeWidth={1.75} aria-hidden />
                lead
              </Link>
            )}
            {event.relatedTaskId && (
              <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                <ListChecks className="h-2.5 w-2.5" strokeWidth={1.75} aria-hidden />
                tarefa
              </span>
            )}
            {event.relatedNoteId && (
              <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                <StickyNote className="h-2.5 w-2.5" strokeWidth={1.75} aria-hidden />
                nota
              </span>
            )}
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-border-subtle bg-surface px-1.5 py-0.5 text-[10px] text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {!completed && !cancelled && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cancelar evento"
            onClick={(e) => {
              e.stopPropagation()
              void guard(onCancel)
            }}
            disabled={busy}
            className="h-7 w-7 opacity-0 transition-opacity duration-fast group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </Button>
        )}
        {completed && (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-success">
            <CheckCircle2 className="h-3 w-3" strokeWidth={2} aria-hidden />
            concluído
          </span>
        )}
      </div>
    </div>
  )
}
