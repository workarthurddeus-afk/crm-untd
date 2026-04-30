'use client'

import { useEffect, useMemo } from 'react'
import { SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadsToolbar } from '@/components/leads/leads-toolbar'
import { LeadsTableSkeleton } from '@/components/leads/leads-table-skeleton'
import { useLeads } from '@/lib/hooks/use-leads'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import { useICPProfile } from '@/lib/hooks/use-icp-profile'
import { useFiltersStore } from '@/lib/stores'
import { filterLeads } from '@/lib/services/lead-filtering'
import { calculateICPScore } from '@/lib/services/scoring.service'
import { leadsRepo } from '@/lib/repositories/leads.repository'

export default function LeadsPage() {
  const { leads, isLoading } = useLeads()
  const { stages } = usePipelineStages()
  const { profile } = useICPProfile()
  const filters = useFiltersStore((s) => s.leads)
  const resetFilters = useFiltersStore((s) => s.resetLeadFilters)

  // Recalculate ICP scores in storage when profile or leads change.
  // Only writes leads whose score actually changed, in parallel.
  useEffect(() => {
    if (!profile || leads.length === 0) return

    const drift = leads
      .map((lead) => {
        const fresh = calculateICPScore(lead, profile).total
        return fresh !== lead.icpScore ? { id: lead.id, icpScore: fresh } : null
      })
      .filter((entry): entry is { id: string; icpScore: number } => entry !== null)

    if (drift.length === 0) return

    try {
      void Promise.allSettled(
        drift.map((entry) =>
          leadsRepo.update(entry.id, { icpScore: entry.icpScore })
        )
      )
    } catch {
      // Repo errors here would only be programmer errors (e.g. id mismatch);
      // they should not surface to the user mid-recalc.
    }
  }, [profile, leads])

  const filtered = useMemo(() => filterLeads(leads, filters), [leads, filters])

  const description = (
    <span>
      <span className="font-display font-semibold text-text tabular-nums">
        {filtered.length}
      </span>
      <span className="text-text-muted"> de </span>
      <span className="font-display tabular-nums text-text-secondary">
        {leads.length}
      </span>
      <span className="text-text-muted"> leads</span>
    </span>
  )

  return (
    <div>
      <PageHeader title="Leads" description={description} />
      <LeadsToolbar
        onCreate={() =>
          toast.info('Formulário de novo lead chega na Task 19.', {
            description: 'Por enquanto, edite via console ou seed.',
          })
        }
      />
      <div className="px-8 py-6">
        {isLoading ? (
          <LeadsTableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum lead bate com esses filtros."
            description="Ajuste a busca ou limpe os filtros para ver tudo."
            action={
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <LeadsTable leads={filtered} stages={stages} />
        )}
      </div>
    </div>
  )
}
