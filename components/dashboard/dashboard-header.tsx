'use client'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Search, Plus, ListChecks, NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { greetingFor } from '@/lib/utils/greeting'

interface Props {
  today: Date
  onCreateLead: () => void
  onCreateTask: () => void
  onCreateNote: () => void
}

export function DashboardHeader({ today, onCreateLead, onCreateTask, onCreateNote }: Props) {
  const greeting = useMemo(() => greetingFor(today), [today])
  const dateLabel = useMemo(
    () => format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
    [today]
  )
  const dateCapitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
  const Icon = greeting.Icon

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

      <div className="flex items-center gap-2">
        <div className="relative w-full sm:w-56 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} aria-hidden />
          <Input placeholder="Buscar lead, tarefa, nota..." className="pl-9 h-9 text-sm" />
        </div>
        <Button variant="secondary" size="sm" onClick={onCreateLead}>
          <Plus aria-hidden /> Lead
        </Button>
        <Button variant="secondary" size="sm" onClick={onCreateTask}>
          <ListChecks aria-hidden /> Tarefa
        </Button>
        <Button variant="secondary" size="sm" onClick={onCreateNote}>
          <NotebookPen aria-hidden /> Nota
        </Button>
      </div>
    </header>
  )
}
