'use client'

import { ChevronLeft, ChevronRight, Filter, RotateCcw, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import {
  calendarImportanceLabel,
  calendarStatusLabel,
  calendarTypeLabel,
  formatMonthYear,
} from '@/lib/utils/calendar-display'
import {
  CALENDAR_EVENT_STATUSES,
  CALENDAR_EVENT_TYPES,
  CALENDAR_IMPORTANCES,
  type CalendarEventStatus,
  type CalendarEventType,
  type CalendarImportance,
  type CalendarView,
} from '@/lib/types'

export interface CalendarFilterState {
  type?: CalendarEventType | 'all'
  status?: CalendarEventStatus | 'all'
  importance?: CalendarImportance | 'all'
  remindersOnly: boolean
  hideCompleted: boolean
}

export const DEFAULT_FILTERS: CalendarFilterState = {
  type: 'all',
  status: 'all',
  importance: 'all',
  remindersOnly: false,
  hideCompleted: false,
}

interface Props {
  cursor: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  filters: CalendarFilterState
  onFilterChange: (next: CalendarFilterState) => void
}

const VIEW_OPTIONS: Array<{ value: CalendarView; label: string }> = [
  { value: 'month', label: 'Mês' },
  { value: 'week', label: 'Semana' },
  { value: 'day', label: 'Dia' },
  { value: 'agenda', label: 'Agenda' },
]

function activeFilterCount(filters: CalendarFilterState): number {
  let n = 0
  if (filters.type && filters.type !== 'all') n += 1
  if (filters.status && filters.status !== 'all') n += 1
  if (filters.importance && filters.importance !== 'all') n += 1
  if (filters.remindersOnly) n += 1
  if (filters.hideCompleted) n += 1
  return n
}

export function CalendarToolbar({
  cursor,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  filters,
  onFilterChange,
}: Props) {
  const filterCount = activeFilterCount(filters)
  const monthLabel = formatMonthYear(cursor)
  const monthCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-8">
      <div className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded-md border border-border bg-surface/60">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none border-r border-border"
            onClick={onPrev}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-none px-3 text-xs"
            onClick={onToday}
          >
            <RotateCcw aria-hidden /> Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none border-l border-border"
            onClick={onNext}
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </Button>
        </div>

        <h2 className="font-display text-base font-semibold tracking-tight text-text">
          {monthCapitalized}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-md border border-border bg-surface/60 p-0.5">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onViewChange(option.value)}
              aria-pressed={view === option.value}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium transition-colors duration-fast',
                view === option.value
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-muted hover:text-text'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Filter aria-hidden />
              Filtros
              {filterCount > 0 && (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 font-mono text-[10px] tabular-nums text-primary">
                  {filterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Filtrar agenda
              </p>
              {filterCount > 0 && (
                <button
                  type="button"
                  onClick={() => onFilterChange(DEFAULT_FILTERS)}
                  className="text-[11px] text-primary underline-offset-2 hover:underline"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-text-secondary">
                  Tipo
                </label>
                <Select
                  value={filters.type ?? 'all'}
                  onValueChange={(v) =>
                    onFilterChange({ ...filters, type: v as CalendarFilterState['type'] })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {CALENDAR_EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {calendarTypeLabel[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-text-secondary">
                  Status
                </label>
                <Select
                  value={filters.status ?? 'all'}
                  onValueChange={(v) =>
                    onFilterChange({ ...filters, status: v as CalendarFilterState['status'] })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {CALENDAR_EVENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {calendarStatusLabel[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-text-secondary">
                  Importância
                </label>
                <Select
                  value={filters.importance ?? 'all'}
                  onValueChange={(v) =>
                    onFilterChange({
                      ...filters,
                      importance: v as CalendarFilterState['importance'],
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {CALENDAR_IMPORTANCES.map((i) => (
                      <SelectItem key={i} value={i}>
                        {calendarImportanceLabel[i]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface/50 px-2.5 py-1.5">
                <span className="text-[11px] text-text-secondary">Apenas lembretes</span>
                <Switch
                  checked={filters.remindersOnly}
                  onCheckedChange={(checked) =>
                    onFilterChange({ ...filters, remindersOnly: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface/50 px-2.5 py-1.5">
                <span className="text-[11px] text-text-secondary">Ocultar concluídos</span>
                <Switch
                  checked={filters.hideCompleted}
                  onCheckedChange={(checked) =>
                    onFilterChange({ ...filters, hideCompleted: checked })
                  }
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {filterCount > 0 && (
        <div className="flex w-full flex-wrap items-center gap-1.5 pt-1">
          {filters.type && filters.type !== 'all' && (
            <Badge
              variant="default"
              className="cursor-pointer pr-1"
              onClick={() => onFilterChange({ ...filters, type: 'all' })}
            >
              Tipo · {calendarTypeLabel[filters.type as CalendarEventType]}
              <X className="h-3 w-3" strokeWidth={2} aria-hidden />
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge
              variant="default"
              className="cursor-pointer pr-1"
              onClick={() => onFilterChange({ ...filters, status: 'all' })}
            >
              Status · {calendarStatusLabel[filters.status as CalendarEventStatus]}
              <X className="h-3 w-3" strokeWidth={2} aria-hidden />
            </Badge>
          )}
          {filters.importance && filters.importance !== 'all' && (
            <Badge
              variant="default"
              className="cursor-pointer pr-1"
              onClick={() => onFilterChange({ ...filters, importance: 'all' })}
            >
              Importância ·{' '}
              {calendarImportanceLabel[filters.importance as CalendarImportance]}
              <X className="h-3 w-3" strokeWidth={2} aria-hidden />
            </Badge>
          )}
          {filters.remindersOnly && (
            <Badge
              variant="default"
              className="cursor-pointer pr-1"
              onClick={() => onFilterChange({ ...filters, remindersOnly: false })}
            >
              Apenas lembretes
              <X className="h-3 w-3" strokeWidth={2} aria-hidden />
            </Badge>
          )}
          {filters.hideCompleted && (
            <Badge
              variant="default"
              className="cursor-pointer pr-1"
              onClick={() => onFilterChange({ ...filters, hideCompleted: false })}
            >
              Sem concluídos
              <X className="h-3 w-3" strokeWidth={2} aria-hidden />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
