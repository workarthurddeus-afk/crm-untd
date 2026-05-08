'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { useLead } from '@/lib/hooks/use-leads'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { LeadFormDialog } from '@/components/leads/lead-form-dialog'
import { LeadDetailHeader } from '@/components/leads/lead-detail-header'
import { LeadDetailTabs } from '@/components/leads/lead-detail-tabs'
import { LeadInteractionDialog } from '@/components/leads/lead-interaction-dialog'
import { NextActionCard } from '@/components/leads/next-action-card'
import { QuickFacts } from '@/components/leads/quick-facts'
import { LeadDetailSkeleton } from '@/components/leads/lead-detail-skeleton'
import { interactionsRepo } from '@/lib/repositories/interaction.repository'
import { leadsRepo } from '@/lib/repositories/leads.repository'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LeadDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { lead, isLoading } = useLead(id)
  const { stages } = usePipelineStages()
  const [editOpen, setEditOpen] = useState(false)
  const [interactionOpen, setInteractionOpen] = useState(false)

  if (isLoading) {
    return <LeadDetailSkeleton />
  }

  if (!lead) {
    return (
      <div className="flex h-full items-center justify-center px-8 py-16">
        <EmptyState
          icon={SearchX}
          title="Lead não encontrado"
          description="Esse lead não existe ou foi removido."
          action={
            <Button asChild variant="primary">
              <Link href="/leads">Voltar para Leads</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const stage = stages.find((s) => s.id === lead.pipelineStageId)

  function confirmMarkWon() {
    if (!lead) return
    const name = lead.name
    const id = lead.id
    const wonStageId = stages.find((item) => item.isFinalWon)?.id ?? 'stage-won'
    toast('Marcar como ganho?', {
      description: `${name} será movido para "Cliente Pagante".`,
      action: {
        label: 'Confirmar',
        onClick: async () => {
          await leadsRepo.update(id, {
            result: 'won',
            pipelineStageId: wonStageId,
          })
          toast.success('Lead marcado como ganho', {
            description: `${name} agora é cliente.`,
          })
        },
      },
    })
  }

  function confirmMarkLost() {
    if (!lead) return
    const id = lead.id
    const lostStageId = stages.find((item) => item.isFinalLost)?.id ?? 'stage-lost'
    toast('Marcar como perdido?', {
      description: 'Lead será movido para "Perdido / Sem Fit".',
      action: {
        label: 'Confirmar',
        onClick: async () => {
          await leadsRepo.update(id, {
            result: 'lost',
            pipelineStageId: lostStageId,
          })
          toast.success('Lead marcado como perdido', {
            description: 'Mantido no histórico.',
          })
        },
      },
    })
  }

  async function reopen() {
    if (!lead) return
    const firstOpenStageId = stages.find((item) => !item.isFinalWon && !item.isFinalLost)?.id ?? 'stage-research'
    await leadsRepo.update(lead.id, {
      result: 'open',
      pipelineStageId: firstOpenStageId,
    })
    toast.success('Lead reaberto')
  }

  return (
    <div className="px-8 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <LeadDetailHeader
            lead={lead}
            stage={stage}
            onEdit={() => setEditOpen(true)}
            onMarkWon={confirmMarkWon}
            onMarkLost={confirmMarkLost}
            onReopen={reopen}
            onLogInteraction={() => setInteractionOpen(true)}
          />
          <LeadDetailTabs lead={lead} stage={stage} />
        </div>
        <aside className="flex flex-col gap-4">
          <NextActionCard
            lead={lead}
            stages={stages}
            onEdit={() => setEditOpen(true)}
            onReopen={reopen}
            onLogInteraction={() => setInteractionOpen(true)}
          />
          <QuickFacts lead={lead} />
        </aside>
      </div>
      <LeadFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={lead}
      />
      <LeadInteractionDialog
        open={interactionOpen}
        leadId={lead.id}
        leadName={lead.name}
        onOpenChange={setInteractionOpen}
        onCreate={interactionsRepo.create}
      />
    </div>
  )
}
