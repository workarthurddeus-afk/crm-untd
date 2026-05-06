'use client'
import { useId, useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { FileText, ListChecks, NotebookPen, Plus, Search, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { greetingFor } from '@/lib/utils/greeting'
import { buildDashboardSearchResults } from '@/lib/utils/dashboard-search'
import type { Lead, Note, Task } from '@/lib/types'

interface Props {
  today: Date
  onCreateLead: () => void
  onCreateTask: () => void
  onCreateNote: () => void
  leads: Lead[]
  tasks: Task[]
  notes: Note[]
}

const resultIcon = {
  lead: UserRound,
  task: ListChecks,
  note: FileText,
}

const resultLabel = {
  lead: 'Lead',
  task: 'Tarefa',
  note: 'Nota',
}

export function DashboardHeader({
  today,
  onCreateLead,
  onCreateTask,
  onCreateNote,
  leads,
  tasks,
  notes,
}: Props) {
  const [query, setQuery] = useState('')
  const greeting = useMemo(() => greetingFor(today), [today])
  const dateLabel = useMemo(
    () => format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
    [today]
  )
  const searchResults = useMemo(
    () => buildDashboardSearchResults({ query, leads, tasks, notes }),
    [query, leads, tasks, notes]
  )
  const hasQuery = query.trim().length > 0
  const resultsId = useId()
  const dateCapitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
  const Icon = greeting.Icon

  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${greeting.iconClass}`} strokeWidth={1.75} aria-hidden />
          <h1 className="font-display text-2xl font-bold text-text">{greeting.label}, Arthur</h1>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          <span>{dateCapitalized}</span>
          <span className="mx-2 text-text-muted/50">·</span>
          <span>Central de comando do UNTD OS</span>
        </p>
      </div>

      <div data-dashboard-header-actions className="flex flex-wrap items-center gap-2 xl:justify-end">
        <div className="relative min-w-[min(100%,18rem)] flex-1 sm:min-w-64 xl:w-72 xl:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setQuery('')
              }
            }}
            placeholder="Buscar lead, tarefa, nota..."
            className="h-9 pl-9 text-sm"
            aria-label="Busca global do Dashboard"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={hasQuery}
            aria-controls={hasQuery ? resultsId : undefined}
          />
          {hasQuery && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg-token">
              {searchResults.length > 0 ? (
                <ul id={resultsId} role="listbox" className="max-h-80 overflow-y-auto p-1.5">
                  {searchResults.map((result) => {
                    const ResultIcon = resultIcon[result.type]
                    return (
                      <li key={`${result.type}-${result.id}`} role="none">
                        <Link
                          href={result.href}
                          onClick={() => setQuery('')}
                          role="option"
                          aria-selected={false}
                          className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-fast hover:bg-primary-muted focus-visible:bg-primary-muted focus-visible:outline-none"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                            <ResultIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-text">
                              {result.title}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-text-muted">
                              {result.description}
                            </span>
                          </span>
                          <Badge variant="outline" className="mt-0.5 text-[10px]">
                            {resultLabel[result.type]}
                          </Badge>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div id={resultsId} role="status" className="px-4 py-3 text-sm text-text-muted">
                  Nenhum resultado encontrado.
                </div>
              )}
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={onCreateLead} className="shrink-0">
          <Plus aria-hidden /> Lead
        </Button>
        <Button variant="secondary" size="sm" onClick={onCreateTask} className="shrink-0">
          <ListChecks aria-hidden /> Tarefa
        </Button>
        <Button variant="secondary" size="sm" onClick={onCreateNote} className="shrink-0">
          <NotebookPen aria-hidden /> Nota
        </Button>
      </div>
    </header>
  )
}
