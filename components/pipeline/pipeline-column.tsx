'use client'

import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { PipelineCard } from './pipeline-card'
import { getPipelineStageAccentStyle } from './pipeline-style-tokens'
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
  // The user can't always tell which column the lead left from. Give the
  // origin a quiet "lifted" treatment so the drag has both endpoints visible.
  const isOriginOfActiveDrag =
    activeLeadStageId === stage.id && activeLeadStageId !== null

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
      data-pipeline-column
      role="region"
      aria-label={`Etapa ${stage.name}. ${leads.length} leads nesta etapa.`}
      className={cn(
        'flex flex-col rounded-lg border w-[min(76vw,280px)] sm:w-[280px] shrink-0',
        // Fill the board's vertical space without magic-number calc() math.
        // The board parent uses `flex flex-1 min-h-0`, so `h-full` here
        // anchors the column to the available height and the inner list
        // becomes the only scrolling surface.
        'h-full min-h-0',
        'transition-colors duration-fast',
        columnBg,
        isOriginOfActiveDrag
          ? 'border-dashed border-primary/30 opacity-80'
          : 'border-border',
        isDroppingFromOtherColumn && 'ring-2 ring-primary/40 ring-inset bg-primary/[0.04]',
      )}
    >
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span
              data-pipeline-stage-dot
              className="h-2 w-2 rounded-full shrink-0 bg-[var(--pipeline-stage-color)]"
              style={getPipelineStageAccentStyle(stage.color)}
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

        <p className="mt-1 text-xs font-mono tabular-nums text-text-secondary">
          {hasRevenue
            ? `R$ ${revenueSum.toLocaleString('pt-BR')}`
            : '—'}
        </p>
      </div>

      <div className="mx-3 h-px bg-border" />

      <div
        data-pipeline-dropzone
        ref={setNodeRef}
        role="list"
        aria-label="Soltar leads aqui"
        className="flex-1 overflow-y-auto px-2 py-2 space-y-2"
      >
        {leads.length === 0 ? (
          // No nested container: the column already provides the bounding
          // surface. Just center the affordance inside it.
          <div className="flex flex-1 min-h-28 flex-col items-center justify-center px-3 py-7 text-center">
            <Plus className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
            <span className="mt-1.5 text-xs font-medium text-text-secondary">Sem leads por aqui</span>
            <span className="mt-1 max-w-[200px] text-[11px] leading-snug text-text-secondary">
              Arraste uma oportunidade para esta etapa.
            </span>
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
