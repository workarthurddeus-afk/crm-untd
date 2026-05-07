'use client'

import { Check, Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils/cn'
import type { Lead, Note, TaskCategory, TaskColor, TaskImportance, TaskSource, TaskStatus } from '@/lib/types'
import {
  TASK_CATEGORY_OPTIONS,
  TASK_COLOR_OPTIONS,
  TASK_IMPORTANCE_OPTIONS,
  TASK_SOURCE_OPTIONS,
  TASK_STATUS_OPTIONS,
} from './task-form-utils'
import {
  defaultTaskAdvancedFilters,
  getActiveTaskFilters,
  getActiveTaskFiltersCount,
  normalizeTaskTag,
  toggleTaskFilterValue,
  type TaskAdvancedFilters,
  type TaskCompletionFilter,
  type TaskDueFilter,
} from './task-filter-utils'

interface Props {
  open: boolean
  filters: TaskAdvancedFilters
  leads: Lead[]
  notes: Note[]
  onOpenChange: (open: boolean) => void
  onChange: (filters: TaskAdvancedFilters) => void
  onReset: () => void
}

interface FilterSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

interface ToggleChipProps<T extends string> {
  label: string
  value: T
  selected: boolean
  onToggle: (value: T) => void
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info'
}

const DUE_OPTIONS: Array<{ value: TaskDueFilter; label: string; description: string; tone?: ToggleChipProps<TaskDueFilter>['tone'] }> = [
  { value: 'all', label: 'Todas', description: 'Nao restringe data' },
  { value: 'overdue', label: 'Atrasadas', description: 'Prazo ja passou', tone: 'danger' },
  { value: 'today', label: 'Hoje', description: 'Vencem hoje', tone: 'warning' },
  { value: 'this-week', label: 'Esta semana', description: 'Proximos 7 dias', tone: 'info' },
  { value: 'upcoming', label: 'Proximas', description: 'Depois de hoje' },
  { value: 'no-date', label: 'Sem data', description: 'Backlog livre' },
]

const COMPLETION_OPTIONS: Array<{ value: TaskCompletionFilter; label: string; description: string; tone?: ToggleChipProps<TaskCompletionFilter>['tone'] }> = [
  { value: 'all', label: 'Todas', description: 'Inclui qualquer estado' },
  { value: 'active', label: 'Ativas', description: 'Pendentes ou em progresso', tone: 'info' },
  { value: 'completed', label: 'Concluidas', description: 'Ja encerradas', tone: 'success' },
  { value: 'cancelled', label: 'Canceladas', description: 'Fora do plano', tone: 'danger' },
]

function FilterSection({ title, description, children }: FilterSectionProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-display text-sm font-semibold text-text">{title}</h3>
        {description && (
          <p className="text-xs leading-relaxed text-text-secondary">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function ToggleChip<T extends string>({
  label,
  value,
  selected,
  onToggle,
  tone = 'default',
}: ToggleChipProps<T>) {
  const selectedClass = {
    default: 'border-primary/45 bg-primary-muted text-text',
    danger: 'border-danger/45 bg-danger/15 text-danger',
    warning: 'border-warning/45 bg-warning/15 text-warning',
    success: 'border-success/45 bg-success/15 text-success',
    info: 'border-info/45 bg-info/15 text-info',
  }[tone]

  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5',
        'text-xs font-medium transition-all duration-base',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected
          ? selectedClass
          : 'border-border-subtle bg-surface/45 text-text-secondary hover:border-border hover:bg-surface'
      )}
    >
      {selected && <Check className="h-3 w-3" strokeWidth={2} aria-hidden />}
      <span className="truncate">{label}</span>
    </button>
  )
}

function RelationButton({
  selected,
  primary,
  secondary,
  onClick,
}: {
  selected: boolean
  primary: string
  secondary?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left',
        'transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected
          ? 'border-primary/45 bg-primary-muted'
          : 'border-border-subtle bg-surface/35 hover:border-border hover:bg-surface/70'
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-text">{primary}</span>
        {secondary && (
          <span className="block truncate text-xs text-text-secondary">{secondary}</span>
        )}
      </span>
      <span
        aria-hidden
        className={cn(
          'h-2.5 w-2.5 shrink-0 rounded-full border transition-colors duration-fast',
          selected ? 'border-primary bg-primary' : 'border-border bg-transparent'
        )}
      />
    </button>
  )
}

export function TaskActiveFilterChips({
  filters,
  onRemove,
  onReset,
}: {
  filters: TaskAdvancedFilters
  onRemove: (id: string) => void
  onReset: () => void
}) {
  const active = getActiveTaskFilters(filters)
  if (active.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 pb-3 sm:px-6 lg:px-8">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
        Filtros ativos
      </span>
      {active.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onRemove(filter.id)}
          className={cn(
            'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-primary/25',
            'bg-primary-muted px-2.5 text-xs font-medium text-text transition-colors duration-fast',
            'hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
          )}
        >
          {filter.label}
          <X className="h-3 w-3 text-text-secondary" strokeWidth={1.75} aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-medium text-text-secondary transition-colors duration-fast hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        Limpar todos
      </button>
    </div>
  )
}

export function TasksFilterSheet({
  open,
  filters,
  leads,
  notes,
  onOpenChange,
  onChange,
  onReset,
}: Props) {
  const activeCount = getActiveTaskFiltersCount(filters)
  const update = (patch: Partial<TaskAdvancedFilters>) => onChange({ ...filters, ...patch })

  function removeTag(tag: string) {
    update({ tags: filters.tags.filter((item) => item !== tag) })
  }

  function addTagFromInput(value: string) {
    const normalized = normalizeTaskTag(value)
    if (!normalized || filters.tags.includes(normalized)) return
    update({ tags: [...filters.tags, normalized] })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(460px,96vw)] max-w-[96vw]">
        <SheetHeader className="bg-gradient-to-b from-surface-elevated to-surface">
          <div className="flex items-center gap-3 pr-8">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <SheetTitle>Filtros de tarefas</SheetTitle>
              <SheetDescription>
                Reduza a lista ao que importa agora: prazo, contexto, energia e estado.
              </SheetDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant={activeCount > 0 ? 'default' : 'outline'}>
              {activeCount} ativo{activeCount === 1 ? '' : 's'}
            </Badge>
            {filters.due !== 'all' && <Badge variant="warning">Prazo em foco</Badge>}
            {filters.completion !== 'all' && <Badge variant="info">Estado filtrado</Badge>}
          </div>
        </SheetHeader>

        <SheetBody className="space-y-6">
          <FilterSection title="Busca" description="Titulo, descricao ou tags.">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={filters.query}
                onChange={(event) => update({ query: event.target.value })}
                placeholder="Buscar tarefa, tag ou contexto..."
                aria-label="Buscar tarefas nos filtros"
                className="pl-9"
              />
            </div>
          </FilterSection>

          <Separator />

          <FilterSection title="Vencimento" description="Recorte a execucao pelo tempo.">
            <div className="grid gap-2">
              {DUE_OPTIONS.map((option) => (
                <RelationButton
                  key={option.value}
                  selected={filters.due === option.value}
                  primary={option.label}
                  secondary={option.description}
                  onClick={() => update({ due: option.value })}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Estado operacional" description="Controle o que ainda pede acao.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {COMPLETION_OPTIONS.map((option) => (
                <ToggleChip
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  tone={option.tone}
                  selected={filters.completion === option.value}
                  onToggle={(value) => update({ completion: value })}
                />
              ))}
            </div>
          </FilterSection>

          <Separator />

          <FilterSection title="Status" description="Selecione um ou mais status especificos.">
            <div className="flex flex-wrap gap-2">
              {TASK_STATUS_OPTIONS.map((option) => (
                <ToggleChip<TaskStatus>
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  selected={filters.statuses.includes(option.value)}
                  onToggle={(value) =>
                    update({ statuses: toggleTaskFilterValue(filters.statuses, value) })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Importancia" description="Separe foco real de backlog.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TASK_IMPORTANCE_OPTIONS.map((option) => (
                <ToggleChip<TaskImportance>
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  tone={option.value === 'high' ? 'danger' : option.value === 'medium' ? 'warning' : 'default'}
                  selected={filters.importances.includes(option.value)}
                  onToggle={(value) =>
                    update({ importances: toggleTaskFilterValue(filters.importances, value) })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Categoria" description="Tipo de acao dentro do sistema operacional.">
            <div className="flex flex-wrap gap-2">
              {TASK_CATEGORY_OPTIONS.map((option) => (
                <ToggleChip<TaskCategory>
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  selected={filters.categories.includes(option.value)}
                  onToggle={(value) =>
                    update({ categories: toggleTaskFilterValue(filters.categories, value) })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <Separator />

          <FilterSection title="Origem" description="De onde nasceu a tarefa.">
            <div className="flex flex-wrap gap-2">
              {TASK_SOURCE_OPTIONS.map((option) => (
                <ToggleChip<TaskSource>
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  selected={filters.sources.includes(option.value)}
                  onToggle={(value) =>
                    update({ sources: toggleTaskFilterValue(filters.sources, value) })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Cor" description="Marcadores visuais preparados para a UI.">
            <div className="flex flex-wrap gap-2">
              {TASK_COLOR_OPTIONS.map((option) => {
                const selected = filters.colors.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      update({ colors: toggleTaskFilterValue<TaskColor>(filters.colors, option.value) })
                    }
                    aria-pressed={selected}
                    aria-label={`Filtrar cor ${option.label}`}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-md border transition-all duration-base',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      selected
                        ? 'border-primary/50 bg-primary-muted'
                        : 'border-border-subtle bg-surface/40 hover:border-border'
                    )}
                  >
                    <span className={cn('h-4 w-4 rounded-full', option.className)} />
                  </button>
                )
              })}
            </div>
          </FilterSection>

          <Separator />

          <FilterSection title="Lead relacionado" description="Filtre tarefas ligadas a oportunidades.">
            <div className="grid gap-2">
              {leads.slice(0, 8).map((lead) => (
                <RelationButton
                  key={lead.id}
                  selected={filters.relatedLeadIds.includes(lead.id)}
                  primary={lead.name}
                  secondary={lead.company}
                  onClick={() =>
                    update({
                      relatedLeadIds: toggleTaskFilterValue(filters.relatedLeadIds, lead.id),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Nota relacionada" description="Encontre acoes derivadas da memoria estrategica.">
            <div className="grid gap-2">
              {notes.slice(0, 8).map((note) => (
                <RelationButton
                  key={note.id}
                  selected={filters.relatedNoteIds.includes(note.id)}
                  primary={note.title}
                  secondary={note.type}
                  onClick={() =>
                    update({
                      relatedNoteIds: toggleTaskFilterValue(filters.relatedNoteIds, note.id),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Tags" description="Digite uma tag e pressione Enter.">
            <Input
              placeholder="follow-up, proposta, icp..."
              aria-label="Adicionar tag aos filtros"
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                addTagFromInput(event.currentTarget.value)
                event.currentTarget.value = ''
              }}
            />
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-xs text-text-secondary transition-colors duration-fast hover:border-primary/30 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    #{tag}
                    <X className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                  </button>
                ))}
              </div>
            )}
          </FilterSection>
        </SheetBody>

        <SheetFooter className="bg-surface/80">
          <Button variant="ghost" onClick={onReset} disabled={activeCount === 0}>
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Limpar filtros
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export { defaultTaskAdvancedFilters, getActiveTaskFiltersCount }
