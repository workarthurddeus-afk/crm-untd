'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ICPScoreRing } from '@/components/shared/icp-score-ring'
import { calculateICPScore } from '@/lib/services/scoring.service'
import { useICPProfile } from '@/lib/hooks/use-icp-profile'
import { cn } from '@/lib/utils/cn'
import type { Lead, ICPCriterionResult } from '@/lib/types'

interface Props {
  lead: Lead
  size?: number
  strokeWidth?: number
  pulse?: boolean
}

function gradeLabel(total: number): { label: string; className: string } {
  if (total >= 80) return { label: 'Fit excelente', className: 'text-success' }
  if (total >= 60) return { label: 'Bom fit', className: 'text-info' }
  if (total >= 40) return { label: 'Fit parcial', className: 'text-warning' }
  return { label: 'Fit fraco', className: 'text-text-muted' }
}

interface CriterionRowProps {
  criterion: ICPCriterionResult
  maxContribution: number
  index: number
  reduced: boolean | null
}

function CriterionRow({ criterion, maxContribution, index, reduced }: CriterionRowProps) {
  const fillWidth = criterion.positive && maxContribution > 0 ? 100 : 0
  const delay = reduced ? 0 : index * 0.05

  return (
    <div className="py-2">
      <div className="flex items-center gap-2">
        {criterion.positive ? (
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-success"
            strokeWidth={1.5}
            aria-hidden
          />
        ) : (
          <XCircle
            className="h-4 w-4 shrink-0 text-text-muted"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-sm font-medium',
            criterion.positive ? 'text-text' : 'text-text-muted'
          )}
        >
          {criterion.name}
        </span>
        <span
          className={cn(
            'shrink-0 font-mono text-xs tabular-nums',
            criterion.positive ? 'text-success' : 'text-text-muted'
          )}
        >
          +{Math.round(criterion.contribution)}pt
        </span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className={cn('h-full rounded-full', criterion.positive ? 'bg-success' : 'bg-transparent')}
          initial={{ width: '0%' }}
          animate={{ width: `${fillWidth}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.4, ease: 'easeOut', delay }
          }
        />
      </div>
    </div>
  )
}

export function ICPScorePopover({
  lead,
  size = 72,
  strokeWidth = 5,
  pulse,
}: Props) {
  const { profile } = useICPProfile()
  const reduced = useReducedMotion()

  const breakdown = profile ? calculateICPScore(lead, profile) : null

  const ring = (
    <ICPScoreRing
      score={lead.icpScore}
      size={size}
      strokeWidth={strokeWidth}
      showLabel
      pulse={pulse}
    />
  )

  if (!breakdown) {
    return (
      <div title="Carregando..." aria-label="Carregando pontuação ICP">
        {ring}
      </div>
    )
  }

  const sorted = [...breakdown.criteria].sort((a, b) => {
    if (a.positive !== b.positive) return a.positive ? -1 : 1
    return b.contribution - a.contribution
  })

  const maxContribution =
    breakdown.criteria.length > 0
      ? Math.max(...breakdown.criteria.map((c) => (c.weight / breakdown.criteria.reduce((s, x) => s + x.weight, 0)) * 100))
      : 100

  const grade = gradeLabel(breakdown.total)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Ver detalhamento do ICP"
          className={cn(
            'cursor-pointer rounded-full',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
          )}
        >
          {ring}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 max-h-[70vh] overflow-y-auto p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <span className="text-sm font-semibold text-text">Score ICP</span>
        </div>

        <div className="flex items-center gap-3 px-4 pb-4">
          <ICPScoreRing
            score={breakdown.total}
            size={48}
            strokeWidth={4}
            showLabel
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text">{breakdown.total}</span>
              {' de 100 pontos'}
            </p>
            <span className={cn('text-xs font-medium', grade.className)}>
              {grade.label}
            </span>
          </div>
        </div>

        <Separator />

        <div className="px-4 py-1">
          {sorted.map((criterion, index) => (
            <CriterionRow
              key={criterion.criterionId}
              criterion={criterion}
              maxContribution={maxContribution}
              index={index}
              reduced={reduced}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
