'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { LeadFormDialog } from '@/components/leads/lead-form-dialog'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import { PipelineBoardSkeleton } from '@/components/pipeline/pipeline-board-skeleton'
import { useLeads } from '@/lib/hooks/use-leads'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'

export default function CRMPage() {
  const { leads, isLoading: leadsLoading } = useLeads()
  const { stages, isLoading: stagesLoading } = usePipelineStages()
  const [showCreate, setShowCreate] = useState(false)

  const isLoading = leadsLoading || stagesLoading
  const openLeads = leads.filter((l) => l.result === 'open')
  const totalRevenue = openLeads.reduce((sum, l) => sum + (l.revenuePotential ?? 0), 0)

  const description = (
    <span>
      <span className="font-display font-semibold text-text tabular-nums">
        {openLeads.length}
      </span>
      <span className="text-text-muted"> leads ativos · </span>
      <span className="font-display tabular-nums text-text-secondary">
        R$ {totalRevenue.toLocaleString('pt-BR')}
      </span>
      <span className="text-text-muted"> em pipeline</span>
    </span>
  )

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader
        title="CRM / Pipeline"
        description={description}
        actions={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus aria-hidden />
            Novo lead
          </Button>
        }
      />
      {isLoading ? (
        <PipelineBoardSkeleton />
      ) : (
        <PipelineBoard
          leads={leads}
          stages={stages}
          onNewLead={() => setShowCreate(true)}
        />
      )}
      <LeadFormDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
