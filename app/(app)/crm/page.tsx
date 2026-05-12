'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { LeadFormDialog } from '@/components/leads/lead-form-dialog'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import { PipelineBoardSkeleton } from '@/components/pipeline/pipeline-board-skeleton'
import { useLeads } from '@/lib/hooks/use-leads'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import { leadsNeedingFollowUpToday } from '@/lib/services/follow-up.service'
import type { Lead } from '@/lib/types'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function buildHeaderSummary(leads: Lead[], today: Date): string | null {
  const followUpsToday = leadsNeedingFollowUpToday(leads, today).length
  const newSinceYesterday = leads.filter((lead) => {
    if (lead.result !== 'open') return false
    const created = new Date(lead.createdAt).getTime()
    return today.getTime() - created < ONE_DAY_MS
  }).length

  const parts: string[] = []
  if (followUpsToday > 0) {
    parts.push(
      `${followUpsToday} follow-up${followUpsToday === 1 ? '' : 's'} vencendo hoje`
    )
  }
  if (newSinceYesterday > 0) {
    parts.push(
      `${newSinceYesterday} lead${newSinceYesterday === 1 ? '' : 's'} novo${newSinceYesterday === 1 ? '' : 's'} desde ontem`
    )
  }

  if (parts.length === 0) return null
  return `${parts.join(' · ')}.`
}

export default function CRMPage() {
  const { leads, isLoading: leadsLoading } = useLeads()
  const { stages, isLoading: stagesLoading } = usePipelineStages()
  const [showCreate, setShowCreate] = useState(false)

  const isLoading = leadsLoading || stagesLoading

  // Operational description: prefer live signals over a tautological subtitle
  // ("Movimente oportunidades por etapa"). When nothing's urgent, omit it.
  const headerDescription = useMemo(() => {
    if (isLoading) return null
    return buildHeaderSummary(leads, new Date())
  }, [leads, isLoading])

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader
        title="CRM / Pipeline"
        description={headerDescription ?? undefined}
        className="flex-col px-4 sm:flex-row sm:px-6 lg:px-8"
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
