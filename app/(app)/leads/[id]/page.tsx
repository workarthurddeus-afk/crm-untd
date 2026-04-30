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
import { NextActionCard } from '@/components/leads/next-action-card'
import { QuickFacts } from '@/components/leads/quick-facts'
import { LeadDetailSkeleton } from '@/components/leads/lead-detail-skeleton'
import { leadsRepo } from '@/lib/repositories/leads.repository'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LeadDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { lead, isLoading } = useLead(id)
  const { stages } = usePipelineStages()
  const [editOpen, setEditOpen] = useState(false)

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
    toast('Marcar como ganho?', {
      description: `${name} será movido para "Cliente Pagante".`,
      action: {
        label: 'Confirmar',
        onClick: async () => {
          await leadsRepo.update(id, {
            result: 'won',
            pipelineStageId: 'stage-won',
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
    toast('Marcar como perdido?', {
      description: 'Lead será movido para "Perdido / Sem Fit".',
      action: {
        label: 'Confirmar',
        onClick: async () => {
          await leadsRepo.update(id, {
            result: 'lost',
            pipelineStageId: 'stage-lost',
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
    await leadsRepo.update(lead.id, {
      result: 'open',
      pipelineStageId: 'stage-research',
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
            onLogInteraction={() =>
              toast.info('Diálogo de interação chega na Task 21.')
            }
          />
          <LeadDetailTabs lead={lead} stage={stage} />
        </div>
        <aside className="flex flex-col gap-4">
          <NextActionCard
            lead={lead}
            stages={stages}
            onEdit={() => setEditOpen(true)}
            onReopen={reopen}
          />
          <QuickFacts lead={lead} />
        </aside>
      </div>
      <LeadFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={lead}
      />
    </div>
  )
}
