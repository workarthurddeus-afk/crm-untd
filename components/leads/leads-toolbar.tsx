'use client'

import { useEffect, useMemo, useState } from 'react'
import { Filter, Plus, RotateCcw, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getActiveLeadFiltersCount,
  LeadsFilterSheet,
} from '@/components/leads/leads-filter-sheet'
import {
  defaultLeadFilters,
  useFiltersStore,
  type LeadFilters,
} from '@/lib/stores/filters.store'

interface Props {
  onCreate: () => void
}

const SEARCH_DEBOUNCE_MS = 150

function isDefaultFilters(filters: LeadFilters): boolean {
  return (
    filters.search === defaultLeadFilters.search &&
    filters.origins.length === 0 &&
    filters.temperatures.length === 0 &&
    filters.results.length === 0 &&
    filters.scoreMin === defaultLeadFilters.scoreMin &&
    filters.scoreMax === defaultLeadFilters.scoreMax &&
    filters.pipelineStageIds.length === 0 &&
    filters.tagIds.length === 0 &&
    filters.followUpDue === defaultLeadFilters.followUpDue
  )
}

export function LeadsToolbar({ onCreate }: Props) {
  const filters = useFiltersStore((s) => s.leads)
  const setFilters = useFiltersStore((s) => s.setLeadFilters)
  const reset = useFiltersStore((s) => s.resetLeadFilters)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Lazy initializer so we read the persisted store value once on mount only.
  const [searchInput, setSearchInput] = useState(() =>
    useFiltersStore.getState().leads.search
  )

  // Debounced commit to store. Only fires when local input differs from store.
  useEffect(() => {
    if (searchInput === filters.search) return
    const handle = window.setTimeout(() => {
      setFilters({ search: searchInput })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [searchInput, filters.search, setFilters])

  // If store resets externally (e.g. "Limpar filtros" CTA), sync local input.
  useEffect(() => {
    if (filters.search !== searchInput && filters.search === '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchInput('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search])

  const hasActiveFilters = useMemo(() => !isDefaultFilters(filters), [filters])
  const activeFilterCount = useMemo(
    () => getActiveLeadFiltersCount(filters),
    [filters]
  )

  return (
    <div data-leads-toolbar className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6 lg:px-8">
      <div data-leads-search className="relative min-w-[min(100%,18rem)] flex-1 lg:max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nome, empresa, nicho..."
          className="pl-9"
          aria-label="Buscar leads"
        />
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setFilterSheetOpen(true)}
        aria-label={`Abrir filtros de leads${activeFilterCount > 0 ? `, ${activeFilterCount} ativos` : ''}`}
        className="relative"
      >
        <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
        Filtros
        {activeFilterCount > 0 && (
          <Badge
            variant="default"
            className="ml-0.5 min-w-5 justify-center px-1.5 py-0 text-[10px]"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          reset()
          setSearchInput('')
        }}
        disabled={!hasActiveFilters}
        aria-label="Limpar filtros"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
        Limpar
      </Button>
      <div className="hidden flex-1 lg:block" />
      <Button onClick={onCreate} size="md" className="w-full sm:w-auto">
        <Plus className="h-4 w-4" strokeWidth={2} />
        Novo lead
      </Button>
      <LeadsFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
      />
    </div>
  )
}
