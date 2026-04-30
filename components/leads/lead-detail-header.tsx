'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ICPScoreRing } from '@/components/shared/icp-score-ring'
import { TemperatureBadge } from '@/components/shared/temperature-badge'
import { OriginTag } from '@/components/shared/origin-tag'
import { tokens } from '@/lib/theme/tokens'
import { cn } from '@/lib/utils/cn'
import { leadInitials, leadIsClosed, pipeColorForStage } from '@/lib/utils/lead-display'
import type { Lead, PipelineStage } from '@/lib/types'

interface Props {
  lead: Lead
  stage?: PipelineStage
  onEdit: () => void
  onMarkWon: () => void
  onMarkLost: () => void
  onReopen: () => void
  onLogInteraction: () => void
}

function avatarTintClasses(stageId: string): string {
  const pipe = pipeColorForStage(stageId)
  if (!pipe) {
    return 'bg-primary-muted text-primary'
  }
  // Map to the pipe-* design tokens (tailwind config exposes them).
  switch (pipe) {
    case 'prospect':
      return 'bg-pipe-prospect/15 text-pipe-prospect'
    case 'contacted':
      return 'bg-pipe-contacted/15 text-pipe-contacted'
    case 'replied':
      return 'bg-pipe-replied/15 text-pipe-replied'
    case 'followup':
      return 'bg-pipe-followup/15 text-pipe-followup'
    case 'proposal':
      return 'bg-pipe-proposal/15 text-pipe-proposal'
    case 'won':
      return 'bg-pipe-won/15 text-pipe-won'
    case 'lost':
      return 'bg-pipe-lost/20 text-pipe-lost'
    default:
      return 'bg-primary-muted text-primary'
  }
}

export function LeadDetailHeader({
  lead,
  stage,
  onEdit,
  onMarkWon,
  onMarkLost,
  onReopen,
  onLogInteraction,
}: Props) {
  const reduced = useReducedMotion()
  const closed = leadIsClosed(lead)
  const tint = avatarTintClasses(lead.pipelineStageId)

  const motionProps = reduced
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: tokens.duration.slow / 1000,
          ease: tokens.easing.enter,
        },
      }

  return (
    <motion.div {...motionProps}>
      <div className="mb-4">
        <Link
          href="/leads"
          className={cn(
            'inline-flex items-center gap-1 text-sm text-text-muted',
            'transition-colors duration-fast hover:text-text',
            'focus-visible:outline-none focus-visible:text-text'
          )}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Voltar para Leads
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Identity */}
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className={cn('h-14 w-14 shrink-0 rounded-full', tint)}>
              <AvatarFallback
                className={cn(
                  'font-display text-base font-semibold',
                  tint
                )}
              >
                {leadInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1.5">
              <h1 className="font-display text-2xl font-bold tracking-tight text-text leading-tight truncate">
                {lead.name}
              </h1>
              <p className="text-sm text-text-secondary truncate">
                {lead.role ? `${lead.role} · ${lead.company}` : lead.company}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <OriginTag origin={lead.origin} />
                <TemperatureBadge value={lead.temperature} />
                {stage && (
                  <Badge
                    variant="outline"
                    style={{ color: stage.color, borderColor: 'var(--border)' }}
                  >
                    <span
                      aria-hidden
                      className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.name}
                  </Badge>
                )}
                {closed && lead.result === 'won' && (
                  <Badge variant="success">Ganho</Badge>
                )}
                {closed && lead.result === 'lost' && (
                  <Badge variant="danger">Perdido</Badge>
                )}
                {closed && lead.result === 'no-fit' && (
                  <Badge variant="secondary">Sem fit</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Ring + actions */}
          <div className="flex shrink-0 items-center gap-5">
            <ICPScoreRing
              score={lead.icpScore}
              size={72}
              strokeWidth={5}
              showLabel
              pulse={lead.icpScore >= 80}
            />

            {closed ? (
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={-1}>
                      <Button variant="ghost" size="md" disabled>
                        <Plus aria-hidden />
                        Adicionar interação
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Lead encerrado — reabra para registrar interações.
                  </TooltipContent>
                </Tooltip>
                <Button variant="secondary" onClick={onReopen}>
                  <RotateCcw aria-hidden />
                  Reabrir lead
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={onEdit}>
                  <Pencil aria-hidden />
                  Editar
                </Button>
                <Button variant="primary" onClick={onLogInteraction}>
                  <Plus aria-hidden />
                  Adicionar interação
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Mais ações"
                    >
                      <MoreHorizontal aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    <DropdownMenuItem onSelect={onMarkWon}>
                      <Trophy
                        className="h-4 w-4 text-success"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      Marcar como ganho
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={onMarkLost}
                      className="text-danger hover:text-danger data-[highlighted]:text-danger"
                    >
                      <XCircle
                        className="h-4 w-4"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      Marcar como perdido
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
