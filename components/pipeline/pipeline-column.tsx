'use client'

import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { PipelineCard } from './pipeline-card'
import type { Lead, PipelineStage } from '@/lib/types'

interface Props {
  stage: PipelineStage
  leads: Lead[]
  activeLeadStageId: string | null
}

export function PipelineColumn({ stage, leads, activeLeadStageId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  const isDroppingFromOtherColumn =
    isOver && activeLeadStageId !== null && activeLeadStageId !== stage.id

  const revenueSum = leads.reduce(
    (sum, l) => sum + (l.revenuePotential ?? 0),
    0,
  )
  const hasRevenue = leads.some((l) => (l.revenuePotential ?? 0) > 0)

  const columnBg = stage.isFinalWon
    ? 'bg-success/[0.04]'
    : stage.isFinalLost
      ? 'bg-text-muted/[0.04]'
      : 'bg-surface-elevated/50'

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border w-[280px] shrink-0',
        'max-h-[calc(100vh-220px)]',
        'transition-colors duration-fast',
        columnBg,
        isDroppingFromOtherColumn && 'ring-2 ring-primary/40 ring-inset bg-primary/[0.04]',
      )}
    >
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: stage.color }}
              aria-hidden
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary truncate">
              {stage.name}
            </span>
          </div>
          <Badge variant="secondary" className="font-mono tabular-nums shrink-0">
            {leads.length}
          </Badge>
        </div>

        <p className="mt-1 text-[11px] font-mono tabular-nums text-text-muted">
          {hasRevenue
            ? `R$ ${revenueSum.toLocaleString('pt-BR')}`
            : '—'}
        </p>
      </div>

      <div className="mx-3 h-px bg-border" />

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-2"
      >
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-md mx-1">
            <Plus className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
            <span className="text-xs text-text-muted mt-1">Vazio</span>
          </div>
        ) : (
          leads.map((lead) => (
            <PipelineCard key={lead.id} lead={lead} />
          ))
        )}
      </div>
    </div>
  )
}
