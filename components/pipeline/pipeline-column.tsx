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
        'flex flex-col rounded-lg border border-border w-[min(76vw,280px)] sm:w-[280px] shrink-0',
        'max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-220px)]',
        'transition-colors duration-fast',
        columnBg,
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
        aria-label={`Solte leads em ${stage.name}. ${leads.length} leads nesta etapa.`}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-2"
      >
        {leads.length === 0 ? (
          <div className="flex min-h-28 flex-col items-center justify-center rounded-md border border-dashed border-border-subtle bg-surface/30 px-3 py-7 text-center mx-1">
            <Plus className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
            <span className="mt-1 text-xs font-medium text-text-secondary">Sem leads por aqui</span>
            <span className="mt-0.5 text-[11px] leading-snug text-text-muted">
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
