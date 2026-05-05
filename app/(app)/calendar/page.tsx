'use client'

import { useCallback, useMemo, useState } from 'react'
import { Construction } from 'lucide-react'
import { toast } from 'sonner'
import { useCalendarEvents, useCalendarSummary } from '@/lib/hooks/use-calendar'
import { filterEvents, sortEventsForAgenda } from '@/lib/utils/calendar'
import {
  getDateKey,
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek,
  parseDate,
} from '@/lib/utils/date-range'
import { isOverdueEvent } from '@/lib/utils/calendar-display'
import { CalendarPageHeader } from '@/components/calendar/calendar-page-header'
import { CalendarStatsRow } from '@/components/calendar/calendar-stats-row'
import {
  CalendarToolbar,
  DEFAULT_FILTERS,
  type CalendarFilterState,
} from '@/components/calendar/calendar-toolbar'
import { MonthCalendarGrid } from '@/components/calendar/month-calendar-grid'
import { DayAgendaSidebar } from '@/components/calendar/day-agenda-sidebar'
import { UpcomingEventsPanel } from '@/components/calendar/upcoming-events-panel'
import { EventCreateDialog } from '@/components/calendar/event-create-dialog'
import type {
  CalendarEvent,
  CalendarEventInput,
  CalendarFilters,
  CalendarView,
} from '@/lib/types'

const STABLE_EMPTY_FILTERS: CalendarFilters | undefined = undefined

function shiftMonth(date: Date, delta: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1)
  )
}

function todayUtc(): Date {
  return getStartOfDay(new Date())
}

/**
 * Builds the 42-day window the month grid renders, so we can scope filtering
 * to events visible on screen (including spill days from adjacent months).
 */
function getVisibleMonthRange(cursor: Date): { start: Date; end: Date } {
  const startOfMonth = getStartOfMonth(cursor)
  const start = getStartOfWeek(startOfMonth)
  const end = new Date(start.getTime() + 42 * 86_400_000 - 1)
  return { start, end }
}

function applyToolbarFilters(
  events: CalendarEvent[],
  filters: CalendarFilterState,
  query: string
): CalendarEvent[] {
  const calendarFilters: CalendarFilters = {
    query: query.trim() || undefined,
    type: filters.type && filters.type !== 'all' ? filters.type : undefined,
    status: filters.status && filters.status !== 'all' ? filters.status : undefined,
    importance:
      filters.importance && filters.importance !== 'all' ? filters.importance : undefined,
    isReminder: filters.remindersOnly ? true : undefined,
    includeCompleted: filters.hideCompleted ? false : undefined,
  }
  return filterEvents(events, calendarFilters)
}

export default function CalendarPage() {
  const today = useMemo(() => todayUtc(), [])
  const [cursor, setCursor] = useState<Date>(() => getStartOfMonth(today))
  const [selectedDay, setSelectedDay] = useState<Date>(() => today)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [view, setView] = useState<CalendarView>('month')
  const [filters, setFilters] = useState<CalendarFilterState>(DEFAULT_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAsReminder, setDialogAsReminder] = useState(false)
  const [dialogInitialDate, setDialogInitialDate] = useState<Date>(() => today)

  // Single all-events fetch with stable filters reference; we filter on
  // client to keep the hook from refetching as filters/search change.
  const { events: allEvents, isLoading, actions } = useCalendarEvents(STABLE_EMPTY_FILTERS)
  const { summary, isLoading: summaryLoading } = useCalendarSummary()

  // Visible-range scope for the grid (42 days incl. spill).
  const visibleEvents = useMemo(() => {
    const { start, end } = getVisibleMonthRange(cursor)
    const startMs = start.getTime()
    const endMs = end.getTime()
    return allEvents.filter((event) => {
      const t = parseDate(event.startAt).getTime()
      return t >= startMs && t <= endMs
    })
  }, [allEvents, cursor])

  const filteredVisibleEvents = useMemo(
    () => applyToolbarFilters(visibleEvents, filters, searchQuery),
    [visibleEvents, filters, searchQuery]
  )

  // Day agenda — same toolbar filters apply. We also re-sort so events
  // group cleanly inside the bucketing UI (morning / afternoon / evening).
  const dayAgendaEvents = useMemo(() => {
    const dayKey = getDateKey(selectedDay)
    const sameDay = allEvents.filter((event) => getDateKey(event.startAt) === dayKey)
    const filtered = applyToolbarFilters(sameDay, filters, searchQuery)
    return sortEventsForAgenda(filtered)
  }, [allEvents, selectedDay, filters, searchQuery])

  // Upcoming panel — next 8 events from now. Reuses the same toolbar
  // filters so the panel and the grid stay coherent. Overdue is computed
  // separately below.
  const upcomingEvents = useMemo(() => {
    const fromNow = today.getTime()
    const filtered = applyToolbarFilters(allEvents, filters, searchQuery)
    return filtered
      .filter(
        (event) =>
          parseDate(event.startAt).getTime() >= fromNow &&
          event.status !== 'completed' &&
          event.status !== 'cancelled'
      )
      .slice(0, 6)
  }, [allEvents, filters, searchQuery, today])

  const overdueEvents = useMemo(() => {
    const filtered = applyToolbarFilters(allEvents, filters, searchQuery)
    return filtered.filter((event) => isOverdueEvent(event, today)).slice(0, 5)
  }, [allEvents, filters, searchQuery, today])

  // Stats — prefer summary from service when not loading; fall back to
  // computed values from the in-memory list to keep the row alive even
  // before the service settles.
  const stats = useMemo(() => {
    const fallbackToday = allEvents.filter(
      (event) => getDateKey(event.startAt) === getDateKey(today)
    )
    const fallbackUpcoming = allEvents.filter((event) => {
      const t = parseDate(event.startAt).getTime()
      const sevenDaysAhead = today.getTime() + 7 * 86_400_000
      return (
        t >= today.getTime() &&
        t <= sevenDaysAhead &&
        event.status !== 'completed' &&
        event.status !== 'cancelled'
      )
    })
    const fallbackOverdue = allEvents.filter((event) => isOverdueEvent(event, today))
    const fallbackHighImportance = allEvents.filter((event) => {
      if (event.status === 'completed' || event.status === 'cancelled') return false
      const t = parseDate(event.startAt).getTime()
      return (
        t >= today.getTime() &&
        t <= today.getTime() + 7 * 86_400_000 &&
        (event.importance === 'high' || event.importance === 'critical')
      )
    })

    return {
      todayCount: summary ? summary.todayCount : fallbackToday.length,
      upcomingCount: summary
        ? summary.upcoming.length + fallbackUpcoming.length / 1
        : fallbackUpcoming.length,
      overdueCount: summary ? summary.overdue.length : fallbackOverdue.length,
      highImportanceCount: summary
        ? summary.highImportanceToday.length || fallbackHighImportance.length
        : fallbackHighImportance.length,
    }
  }, [summary, allEvents, today])

  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDay(getStartOfDay(date))
  }, [])

  const handleSelectEvent = useCallback((id: string | null) => {
    setSelectedEventId(id)
  }, [])

  const handlePrevMonth = useCallback(() => setCursor((c) => shiftMonth(c, -1)), [])
  const handleNextMonth = useCallback(() => setCursor((c) => shiftMonth(c, 1)), [])
  const handleJumpToToday = useCallback(() => {
    setCursor(getStartOfMonth(today))
    setSelectedDay(today)
  }, [today])

  const openCreateDialog = useCallback(
    (asReminder: boolean, date: Date) => {
      setDialogAsReminder(asReminder)
      setDialogInitialDate(date)
      setDialogOpen(true)
    },
    []
  )

  const handleCreateEvent = useCallback(
    async (input: CalendarEventInput) => {
      const created = await actions.createEvent(input)
      setSelectedDay(getStartOfDay(created.startAt))
      setSelectedEventId(created.id)
    },
    [actions]
  )

  const handleComplete = useCallback(
    async (eventId: string) => {
      try {
        await actions.completeEvent(eventId)
        toast.success('Evento concluído')
      } catch (err) {
        toast.error('Falha ao concluir', {
          description: err instanceof Error ? err.message : String(err),
        })
      }
    },
    [actions]
  )

  const handleUncomplete = useCallback(
    async (eventId: string) => {
      try {
        await actions.uncompleteEvent(eventId)
        toast.success('Evento reaberto')
      } catch (err) {
        toast.error('Falha ao reabrir', {
          description: err instanceof Error ? err.message : String(err),
        })
      }
    },
    [actions]
  )

  const handleCancel = useCallback(
    async (eventId: string) => {
      try {
        await actions.cancelEvent(eventId)
        toast.success('Evento cancelado')
      } catch (err) {
        toast.error('Falha ao cancelar', {
          description: err instanceof Error ? err.message : String(err),
        })
      }
    },
    [actions]
  )

  const showMonthGrid = view === 'month'

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <CalendarPageHeader
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onJumpToToday={handleJumpToToday}
        onNewEvent={() => openCreateDialog(false, selectedDay)}
        onNewReminder={() => openCreateDialog(true, selectedDay)}
      />

      <div className="grid min-h-0 flex-1 overflow-hidden border-t border-border lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <main className="flex min-w-0 flex-col overflow-hidden">
          <CalendarStatsRow
            todayCount={stats.todayCount}
            upcomingCount={stats.upcomingCount}
            overdueCount={stats.overdueCount}
            highImportanceCount={stats.highImportanceCount}
            isLoading={summaryLoading && allEvents.length === 0}
          />

          <CalendarToolbar
            cursor={cursor}
            view={view}
            onViewChange={setView}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            onToday={handleJumpToToday}
            filters={filters}
            onFilterChange={setFilters}
          />

          <div className="min-h-0 flex-1 p-4 lg:p-6">
            {showMonthGrid ? (
              <MonthCalendarGrid
                cursor={cursor}
                today={today}
                selectedDay={selectedDay}
                events={filteredVisibleEvents}
                onSelectDay={handleSelectDay}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
                isLoading={isLoading && allEvents.length === 0}
              />
            ) : (
              <ComingSoonView view={view} />
            )}
          </div>
        </main>

        <aside className="hidden min-h-0 flex-col border-l border-border bg-surface/30 lg:flex">
          <div className="min-h-0 flex-1">
            <DayAgendaSidebar
              selectedDay={selectedDay}
              events={dayAgendaEvents}
              isLoading={isLoading && allEvents.length === 0}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
              onComplete={handleComplete}
              onUncomplete={handleUncomplete}
              onCancel={handleCancel}
              onAdd={() => openCreateDialog(false, selectedDay)}
              today={today}
            />
          </div>
          <UpcomingEventsPanel
            upcoming={upcomingEvents}
            overdue={overdueEvents}
            isLoading={isLoading && allEvents.length === 0}
            selectedEventId={selectedEventId}
            onSelectEvent={(id) => {
              const event = allEvents.find((e) => e.id === id)
              if (event) {
                setSelectedDay(getStartOfDay(event.startAt))
                setCursor(getStartOfMonth(event.startAt))
              }
              setSelectedEventId(id)
            }}
            today={today}
          />
        </aside>
      </div>

      <EventCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialDate={dialogInitialDate}
        asReminder={dialogAsReminder}
        onSubmit={handleCreateEvent}
      />
    </div>
  )
}

function ComingSoonView({ view }: { view: CalendarView }) {
  const labelMap: Record<CalendarView, string> = {
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
  }
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md rounded-xl border border-dashed border-border-subtle bg-gradient-to-b from-surface/30 to-transparent px-8 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Construction className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-text">
          Vista de {labelMap[view]} em breve
        </h3>
        <p className="mt-1.5 text-sm text-text-muted">
          A V1 do calendário entrega a vista mensal completa. Use a agenda do dia ao lado para
          ações rápidas, ou volte para a vista de mês.
        </p>
      </div>
    </div>
  )
}
