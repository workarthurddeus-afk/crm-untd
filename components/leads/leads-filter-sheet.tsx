'use client'

import { Check, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import {
  defaultLeadFilters,
  useFiltersStore,
  type LeadFilters,
} from '@/lib/stores/filters.store'
import { cn } from '@/lib/utils/cn'
import type { LeadOrigin, LeadResult, LeadTemperature } from '@/lib/types'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FilterSectionProps {
  title: string
  description?: string
  children: ReactNode
}

interface ToggleChipProps<T extends string> {
  label: string
  value: T
  selected: boolean
  onToggle: (value: T) => void
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info'
}

const ORIGIN_OPTIONS: Array<{ value: LeadOrigin; label: string }> = [
  { value: 'cold-dm', label: 'DM fria' },
  { value: 'cold-email', label: 'Cold email' },
  { value: 'in-person', label: 'Presencial' },
  { value: 'referral', label: 'Indicação' },
  { value: 'paid-traffic', label: 'Tráfego' },
  { value: 'social', label: 'Social' },
  { value: 'community', label: 'Comunidade' },
  { value: 'event', label: 'Evento' },
  { value: 'manual-search', label: 'Busca manual' },
  { value: 'other', label: 'Outro' },
]

const TEMPERATURE_OPTIONS: Array<{
  value: LeadTemperature
  label: string
  tone: ToggleChipProps<LeadTemperature>['tone']
}> = [
  { value: 'cold', label: 'Frio', tone: 'info' },
  { value: 'warm', label: 'Morno', tone: 'warning' },
  { value: 'hot', label: 'Quente', tone: 'danger' },
]

const RESULT_OPTIONS: Array<{
  value: LeadResult
  label: string
  tone: ToggleChipProps<LeadResult>['tone']
}> = [
  { value: 'open', label: 'Aberto', tone: 'info' },
  { value: 'won', label: 'Ganho', tone: 'success' },
  { value: 'lost', label: 'Perdido', tone: 'danger' },
  { value: 'no-response', label: 'Sem resposta', tone: 'warning' },
  { value: 'no-fit', label: 'Sem fit', tone: 'default' },
]

const FOLLOW_UP_OPTIONS: Array<{
  value: LeadFilters['followUpDue']
  label: string
  description: string
}> = [
  { value: 'any', label: 'Qualquer', description: 'Todos os leads' },
  { value: 'today', label: 'Hoje', description: 'Ações para hoje' },
  { value: 'overdue', label: 'Atrasado', description: 'Passou do prazo' },
  { value: 'this-week', label: 'Esta semana', description: 'Próximos 7 dias' },
]

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function getActiveLeadFiltersCount(filters: LeadFilters): number {
  let count = 0
  if (filters.search.trim()) count += 1
  if (filters.origins.length) count += filters.origins.length
  if (filters.temperatures.length) count += filters.temperatures.length
  if (filters.results.length) count += filters.results.length
  if (
    filters.scoreMin !== defaultLeadFilters.scoreMin ||
    filters.scoreMax !== defaultLeadFilters.scoreMax
  ) {
    count += 1
  }
  if (filters.pipelineStageIds.length) count += filters.pipelineStageIds.length
  if (filters.tagIds.length) count += filters.tagIds.length
  if (filters.followUpDue !== defaultLeadFilters.followUpDue) count += 1
  return count
}

function FilterSection({ title, description, children }: FilterSectionProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-display text-sm font-semibold text-text">
          {title}
        </h3>
        {description && (
          <p className="text-xs leading-relaxed text-text-muted">
            {description}
          </p>
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
        'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5',
        'text-xs font-medium transition-all duration-base',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected
          ? selectedClass
          : 'border-border-subtle bg-surface/50 text-text-secondary hover:border-border hover:bg-surface'
      )}
    >
      {selected && <Check className="h-3 w-3" strokeWidth={2} aria-hidden />}
      <span className="truncate">{label}</span>
    </button>
  )
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isNaN(next)) return
          onChange(Math.max(0, Math.min(100, next)))
        }}
        className={cn(
          'flex h-9 w-full rounded-md border border-border bg-surface px-3 py-2',
          'font-mono text-sm tabular-nums text-text placeholder:text-text-muted',
          'transition-colors duration-fast',
          'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30'
        )}
      />
    </label>
  )
}

export function LeadsFilterSheet({ open, onOpenChange }: Props) {
  const filters = useFiltersStore((s) => s.leads)
  const setFilters = useFiltersStore((s) => s.setLeadFilters)
  const resetFilters = useFiltersStore((s) => s.resetLeadFilters)
  const { stages } = usePipelineStages()
  const activeCount = getActiveLeadFiltersCount(filters)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[430px] max-w-[94vw]">
        <SheetHeader className="bg-gradient-to-b from-surface-elevated to-surface">
          <div className="flex items-center gap-3 pr-8">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <SheetTitle>Filtros de leads</SheetTitle>
              <SheetDescription>
                Priorize oportunidades por fit, temperatura e próxima ação.
              </SheetDescription>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant={activeCount > 0 ? 'default' : 'outline'}>
              {activeCount} ativo{activeCount === 1 ? '' : 's'}
            </Badge>
            {filters.followUpDue !== 'any' && (
              <Badge variant="warning">Follow-up em foco</Badge>
            )}
            {(filters.scoreMin > 0 || filters.scoreMax < 100) && (
              <Badge variant="info">ICP refinado</Badge>
            )}
          </div>
        </SheetHeader>

        <SheetBody className="space-y-6">
          <FilterSection
            title="Origem"
            description="Canal de aquisição usado no primeiro contato."
          >
            <div className="flex flex-wrap gap-2">
              {ORIGIN_OPTIONS.map((option) => (
                <ToggleChip
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  selected={filters.origins.includes(option.value)}
                  onToggle={(value) =>
                    setFilters({ origins: toggleValue(filters.origins, value) })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <Separator />

          <FilterSection title="Temperatura" description="Energia comercial atual do lead.">
            <div className="grid grid-cols-3 gap-2">
              {TEMPERATURE_OPTIONS.map((option) => (
                <ToggleChip
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  tone={option.tone}
                  selected={filters.temperatures.includes(option.value)}
                  onToggle={(value) =>
                    setFilters({
                      temperatures: toggleValue(filters.temperatures, value),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Resultado" description="Estado comercial consolidado.">
            <div className="flex flex-wrap gap-2">
              {RESULT_OPTIONS.map((option) => (
                <ToggleChip
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  tone={option.tone}
                  selected={filters.results.includes(option.value)}
                  onToggle={(value) =>
                    setFilters({ results: toggleValue(filters.results, value) })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <Separator />

          <FilterSection
            title="Score ICP"
            description="Limite a lista por compatibilidade com o cliente ideal."
          >
            <div className="grid grid-cols-2 gap-3">
              <ScoreInput
                label="Minimo"
                value={filters.scoreMin}
                onChange={(value) =>
                  setFilters({
                    scoreMin: Math.min(value, filters.scoreMax),
                  })
                }
              />
              <ScoreInput
                label="Maximo"
                value={filters.scoreMax}
                onChange={(value) =>
                  setFilters({
                    scoreMax: Math.max(value, filters.scoreMin),
                  })
                }
              />
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-primary transition-all duration-base"
                style={{
                  marginLeft: `${filters.scoreMin}%`,
                  width: `${Math.max(filters.scoreMax - filters.scoreMin, 0)}%`,
                }}
              />
            </div>
          </FilterSection>

          <Separator />

          <FilterSection title="Etapa do pipeline" description="Onde o lead está no funil.">
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <ToggleChip
                  key={stage.id}
                  label={stage.name}
                  value={stage.id}
                  selected={filters.pipelineStageIds.includes(stage.id)}
                  onToggle={(value) =>
                    setFilters({
                      pipelineStageIds: toggleValue(
                        filters.pipelineStageIds,
                        value
                      ),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Follow-up" description="Recorte por urgência de contato.">
            <div className="grid gap-2">
              {FOLLOW_UP_OPTIONS.map((option) => {
                const selected = filters.followUpDue === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilters({ followUpDue: option.value })}
                    aria-pressed={selected}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-2.5 text-left',
                      'transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      selected
                        ? 'border-primary/45 bg-primary-muted'
                        : 'border-border-subtle bg-surface/35 hover:border-border hover:bg-surface/70'
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium text-text">
                        {option.label}
                      </span>
                      <span className="block text-xs text-text-muted">
                        {option.description}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        'h-2.5 w-2.5 rounded-full border transition-colors duration-fast',
                        selected
                          ? 'border-primary bg-primary'
                          : 'border-border bg-transparent'
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </FilterSection>
        </SheetBody>

        <SheetFooter className="bg-surface/80">
          <Button
            variant="ghost"
            onClick={resetFilters}
            disabled={activeCount === 0}
          >
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
