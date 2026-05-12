'use client'

import { useMemo } from 'react'
import { CalendarPlus, CalendarX2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import {
  bucketForEvent,
  dayBucketLabel,
  formatLongDate,
  type DayBucket,
} from '@/lib/utils/calendar-display'
import { DayAgendaItem } from './day-agenda-item'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  selectedDay: Date
  events: CalendarEvent[]
  isLoading: boolean
  selectedEventId: string | null
  onSelectEvent: (eventId: string | null) => void
  onComplete: (eventId: string) => Promise<void> | void
  onUncomplete: (eventId: string) => Promise<void> | void
  onCancel: (eventId: string) => Promise<void> | void
  onDelete: (event: CalendarEvent) => void
  onAdd: () => void
  today: Date
}

const BUCKET_ORDER: DayBucket[] = ['all-day', 'morning', 'afternoon', 'evening']

function BucketHeader({ bucket, count }: { bucket: DayBucket; count: number }) {
  if (bucket === 'all-day') {
    return (
      <div className="mb-1.5 flex items-center gap-2 px-1">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted/80">
          Dia inteiro
        </span>
        <span className="font-mono text-[10px] tabular-nums text-text-muted/60">
          {count}
        </span>
        <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-border-subtle/80 to-transparent" />
      </div>
    )
  }

  return (
    <div className="mb-1.5 flex items-center gap-2 px-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
        {dayBucketLabel[bucket]}
      </span>
      <span className="font-mono text-[10px] tabular-nums text-text-muted/70">
        {count}
      </span>
    </div>
  )
}

function AgendaSkeleton() {
  return (
    <div className="space-y-2.5 p-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border-subtle bg-surface/40 px-3 py-2.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-2 h-3.5 w-3/4" />
          <Skeleton className="mt-1.5 h-2.5 w-full" />
          <div className="mt-2.5 flex gap-1.5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DayAgendaSidebar({
  selectedDay,
  events,
  isLoading,
  selectedEventId,
  onSelectEvent,
  onComplete,
  onUncomplete,
  onCancel,
  onDelete,
  onAdd,
  today,
}: Props) {
  const grouped = useMemo(() => {
    const map: Record<DayBucket, CalendarEvent[]> = {
      'all-day': [],
      morning: [],
      afternoon: [],
      evening: [],
    }
    for (const event of events) {
      map[bucketForEvent(event)].push(event)
    }
    return map
  }, [events])

  const totalCount = events.length
  const dateLabel = formatLongDate(selectedDay)
  const isToday = selectedDay.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)

  return (
    <section className="flex h-full min-w-0 flex-col">
      <header className="border-b border-border-subtle bg-surface/30 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Agenda do dia
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-text">
              {dateLabel}
              {isToday && (
                <span className="ml-2 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  hoje
                </span>
              )}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              <span className="font-mono tabular-nums text-text-secondary">{totalCount}</span>{' '}
              {totalCount === 1 ? 'evento' : 'eventos'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAdd}
            aria-label="Adicionar neste dia"
          >
            <CalendarPlus aria-hidden /> Adicionar
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {isLoading ? (
          <AgendaSkeleton />
        ) : totalCount === 0 ? (
          <div className="flex h-full items-center justify-center px-6 py-8">
            <div className="rounded-xl border border-dashed border-border-subtle bg-gradient-to-b from-surface/30 to-transparent px-6 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarX2 className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-text">
                Nada agendado para este dia
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-text-muted">
                Aproveite para criar um lembrete ou bloquear um foco profundo.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="primary" size="sm" onClick={onAdd}>
                  <CalendarPlus aria-hidden /> Adicionar evento
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4 p-3">
              {BUCKET_ORDER.map((bucket) => {
                const list = grouped[bucket]
                if (list.length === 0) return null
                return (
                  <div key={bucket}>
                    <BucketHeader bucket={bucket} count={list.length} />
                    <div className="space-y-1.5">
                      {list.map((event) => (
                        <DayAgendaItem
                          key={event.id}
                          event={event}
                          selected={event.id === selectedEventId}
                          onSelect={() => onSelectEvent(event.id)}
                          onComplete={() => onComplete(event.id)}
                          onUncomplete={() => onUncomplete(event.id)}
                          onCancel={() => onCancel(event.id)}
                          onDelete={() => onDelete(event)}
                          today={today}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </section>
  )
}

/**
 * Used by the orchestrator to surface a "no day selected" decoy. Lives next
 * to the sidebar so the empty rail can share the same branding.
 */
export function DayAgendaPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface/30 px-6 py-10 text-center',
        className
      )}
    >
      <div>
        <h3 className="font-display text-base font-semibold text-text">
          Selecione um dia
        </h3>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-text-muted">
          Toque em uma data no calendário para abrir os eventos do dia.
        </p>
      </div>
    </div>
  )
}
