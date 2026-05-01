'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useReducedMotion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { OriginTag } from '@/components/shared/origin-tag'
import { TemperatureBadge } from '@/components/shared/temperature-badge'
import { nextFollowUpStatus } from '@/lib/utils/follow-up-status'
import type { Lead } from '@/lib/types'

interface Props {
  lead: Lead
  isOverlay?: boolean
}

function icpChipClass(score: number): string {
  if (score >= 80) return 'bg-primary/15 text-primary'
  if (score >= 60) return 'bg-info/15 text-info'
  if (score >= 40) return 'bg-warning/15 text-warning'
  return 'bg-text-muted/15 text-text-muted'
}

function followUpToneClass(tone: string): string {
  if (tone === 'overdue') return 'text-danger'
  if (tone === 'today') return 'text-warning'
  if (tone === 'tomorrow') return 'text-info'
  return 'text-text-muted'
}

export function PipelineCard({ lead, isOverlay = false }: Props) {
  const router = useRouter()
  const wasDraggingRef = useRef(false)
  const prefersReducedMotion = useReducedMotion()

  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: lead.id,
    data: { lead },
  })

  useEffect(() => {
    if (isDragging) wasDraggingRef.current = true
  }, [isDragging])

  const style = isOverlay
    ? undefined
    : { transform: CSS.Translate.toString(transform) }

  const subtitle = lead.role
    ? `${lead.role} · ${lead.company}`
    : lead.company

  const followUp = lead.nextFollowUpAt
    ? nextFollowUpStatus(lead.nextFollowUpAt)
    : null

  function handleClick(e: React.MouseEvent) {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
    router.push(`/leads/${lead.id}`)
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={isOverlay ? undefined : handleClick}
      className={cn(
        'bg-surface border border-border rounded-md p-3',
        'transition-all duration-fast',
        'hover:border-primary/30 hover:shadow-md-token',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        isOverlay && [
          !prefersReducedMotion && 'rotate-[2deg] scale-[1.02]',
          'cursor-grabbing',
          'shadow-[0_8px_32px_rgba(0,0,0,0.55)]',
          'border-primary/50',
        ],
        !isOverlay && isDragging && 'opacity-30',
        !isOverlay && !isDragging && 'cursor-grab active:cursor-grabbing',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-sm font-semibold text-text leading-tight truncate min-w-0 flex-1">
          {lead.name}
        </span>
        <span
          className={cn(
            'text-[11px] font-mono font-semibold tabular-nums px-1.5 py-0.5 rounded shrink-0',
            icpChipClass(lead.icpScore),
          )}
        >
          {lead.icpScore}
        </span>
      </div>

      <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>

      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        <OriginTag origin={lead.origin} />
        <TemperatureBadge value={lead.temperature} />
        {lead.revenuePotential != null && lead.revenuePotential > 0 && (
          <span className="ml-auto text-[11px] font-mono tabular-nums text-text-secondary">
            R${' '}
            {lead.revenuePotential.toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {followUp && (
        <div className={cn('mt-2 flex items-center gap-1.5', followUpToneClass(followUp.tone))}>
          <Calendar className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
          <span className="text-[11px]">{followUp.label}</span>
        </div>
      )}
    </div>
  )
}
