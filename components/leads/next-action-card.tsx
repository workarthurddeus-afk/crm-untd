'use client'

import { ArrowRight, Info, Lock, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { computeNextAction } from '@/lib/services/next-action'
import { leadsRepo } from '@/lib/repositories/leads.repository'
import type { Lead, PipelineStage } from '@/lib/types'

interface Props {
  lead: Lead
  stages: PipelineStage[]
  onEdit: () => void
  onReopen: () => void
  onLogInteraction: () => void
}

const toneIcon: Record<'urgent' | 'recommended' | 'info' | 'closed', LucideIcon> = {
  urgent: Zap,
  recommended: ArrowRight,
  info: Info,
  closed: Lock,
}

const toneSurface: Record<'urgent' | 'recommended' | 'info' | 'closed', string> = {
  urgent: 'bg-gradient-to-br from-danger/[0.07] to-transparent border-l-2 border-l-danger',
  recommended: 'bg-gradient-to-br from-primary/[0.07] to-transparent border-l-2 border-l-primary',
  info: '',
  closed: 'opacity-90',
}

const toneIconColor: Record<'urgent' | 'recommended' | 'info' | 'closed', string> = {
  urgent: 'bg-danger/15 text-danger',
  recommended: 'bg-primary-muted text-primary',
  info: 'bg-surface-elevated text-text-secondary',
  closed: 'bg-surface-elevated text-text-muted',
}

const toneLabel: Record<'urgent' | 'recommended' | 'info' | 'closed', string> = {
  urgent: 'Urgente',
  recommended: 'Recomendado',
  info: 'Proxima acao',
  closed: 'Encerrado',
}

const toneLabelColor: Record<'urgent' | 'recommended' | 'info' | 'closed', string> = {
  urgent: 'text-danger',
  recommended: 'text-primary',
  info: 'text-text-muted',
  closed: 'text-text-muted',
}

export function NextActionCard({ lead, stages, onEdit, onReopen, onLogInteraction }: Props) {
  const action = computeNextAction(lead, stages, new Date())
  const Icon = toneIcon[action.tone]

  function handleClick() {
    switch (action.ctaIntent) {
      case 'reopen':
        onReopen()
        return
      case 'edit':
        onEdit()
        return
      case 'log-interaction':
      case 'mark-meeting':
      case 'send-proposal':
        onLogInteraction()
        return
    }
  }

  return (
    <Card className={cn('p-5 flex flex-col gap-4', toneSurface[action.tone])}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
            toneIconColor[action.tone]
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className={cn(
              'text-xs font-medium uppercase tracking-wide',
              toneLabelColor[action.tone]
            )}
          >
            {toneLabel[action.tone]}
          </span>
          <h3 className="font-display text-base font-semibold text-text leading-tight">
            {action.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {action.description}
          </p>
        </div>
      </div>

      <Button
        variant={action.tone === 'closed' ? 'secondary' : 'primary'}
        size="sm"
        onClick={handleClick}
        className="w-full"
      >
        {action.ctaLabel}
      </Button>
    </Card>
  )
}

// Re-export so the page doesn't have to import the repo directly when
// composing fallback closed-action handlers in the future.
export { leadsRepo }
