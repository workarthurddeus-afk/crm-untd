'use client'

import { CalendarPlus, CalendarRange, ChevronsLeftRightEllipsis, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  query: string
  onQueryChange: (value: string) => void
  onJumpToToday: () => void
  onNewEvent: () => void
  onNewReminder: () => void
}

export function CalendarPageHeader({
  query,
  onQueryChange,
  onJumpToToday,
  onNewEvent,
  onNewReminder,
}: Props) {
  return (
    <header className="border-b border-border bg-gradient-to-b from-surface/40 to-transparent">
      <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <CalendarRange className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight text-text">
              Calendário
            </h1>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Agenda, lembretes e ações operacionais do UNTD
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
              strokeWidth={1.75}
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar evento, lead, tag..."
              className="pl-9"
            />
          </div>
          <Button variant="secondary" size="md" onClick={onJumpToToday}>
            <ChevronsLeftRightEllipsis aria-hidden /> Hoje
          </Button>
          <Button variant="secondary" size="md" onClick={onNewReminder}>
            <CalendarPlus aria-hidden /> Lembrete
          </Button>
          <Button variant="primary" size="md" onClick={onNewEvent}>
            <CalendarPlus aria-hidden /> Novo evento
          </Button>
        </div>
      </div>
    </header>
  )
}
