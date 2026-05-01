'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  Equal,
  ListChecks,
  Sigma,
  ToggleRight,
  Type,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCriterionConfig, evaluatorLabel, matchRateColor } from '@/lib/utils/icp-display'
import { cn } from '@/lib/utils/cn'
import type { ICPCriterion, ICPEvaluatorType } from '@/lib/types'

const evaluatorIcon: Record<ICPEvaluatorType, React.ElementType> = {
  'enum-match': Equal,
  'array-includes': ListChecks,
  'numeric-range': Sigma,
  'boolean-true': ToggleRight,
  'string-not-empty': Type,
}

interface Props {
  criterion: ICPCriterion
  matchedCount: number
  totalLeads: number
  index: number
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
      {children}
    </p>
  )
}

export function CriterionCard({ criterion, matchedCount, totalLeads, index }: Props) {
  const reduced = useReducedMotion()
  const Icon = evaluatorIcon[criterion.evaluator]
  const config = formatCriterionConfig(criterion)

  const matchPct = totalLeads > 0 ? Math.round((matchedCount / totalLeads) * 100) : 0
  const fillColor = matchRateColor(matchPct)

  return (
    <Card
      className={cn(
        'p-5',
        'hover:border-primary/30 transition-colors duration-base'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <span className="text-sm font-semibold text-text leading-snug">
            {criterion.name}
          </span>
        </div>
        <Badge variant="secondary" className="font-mono tabular-nums shrink-0">
          {criterion.weight} pt
        </Badge>
      </div>

      {criterion.description && (
        <p className="mt-2 text-xs text-text-muted leading-snug pl-11">
          {criterion.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <MiniLabel>Avaliador</MiniLabel>
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-text-muted shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="text-xs text-text-secondary">
              {evaluatorLabel[criterion.evaluator]}
            </span>
          </div>
        </div>
        <div>
          <MiniLabel>Campo</MiniLabel>
          <code className="font-mono text-xs text-text-secondary bg-surface-elevated px-1.5 py-0.5 rounded-sm">
            {criterion.field}
          </code>
        </div>
      </div>

      <div className="mt-4">
        <MiniLabel>Configuração</MiniLabel>
        {config.kind === 'chips' ? (
          <div className="flex flex-wrap gap-1.5">
            {config.chips.map((chip) => (
              <Badge key={chip} variant="outline">
                {chip}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-secondary">{config.text}</p>
        )}
      </div>

      <div className="mt-4">
        <MiniLabel>Match nos leads atuais</MiniLabel>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', fillColor)}
              initial={reduced ? false : { width: '0%' }}
              animate={{ width: totalLeads > 0 ? `${matchPct}%` : '0%' }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: 0.5,
                      ease: 'easeOut',
                      delay: index * 0.08,
                    }
              }
            />
          </div>
          <span className="text-xs font-mono tabular-nums text-text-muted shrink-0">
            {totalLeads > 0
              ? `${matchPct}% — ${matchedCount} de ${totalLeads} leads`
              : '—'}
          </span>
        </div>
      </div>
    </Card>
  )
}
