'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  Banknote,
  Flame,
  Globe2,
  AtSign,
  ListChecks,
  Megaphone,
  MessageSquareText,
  Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCriterionConfig, matchRateColor } from '@/lib/utils/icp-display'
import { cn } from '@/lib/utils/cn'
import type { ICPCriterion } from '@/lib/types'

interface Props {
  criterion: ICPCriterion
  matchedCount: number
  totalLeads: number
  index: number
}

const fieldTone: Record<string, { icon: React.ElementType; reason: string }> = {
  niche: {
    icon: Target,
    reason: 'Nicho com dor recorrente e compra mais previsível.',
  },
  origin: {
    icon: Megaphone,
    reason: 'Canal indica intenção e maturidade de aquisição.',
  },
  revenuePotential: {
    icon: Banknote,
    reason: 'Potencial financeiro sustenta proposta recorrente.',
  },
  pain: {
    icon: MessageSquareText,
    reason: 'Dor explícita reduz fricção na conversa comercial.',
  },
  temperature: {
    icon: Flame,
    reason: 'Temperatura mostra urgência para priorizar follow-up.',
  },
  instagram: {
    icon: AtSign,
    reason: 'Presença social facilita diagnóstico visual e prova de valor.',
  },
  website: {
    icon: Globe2,
    reason: 'Site próprio sinaliza estrutura mínima de marca.',
  },
}

const valueLabels: Record<string, string> = {
  'paid-traffic': 'Tráfego pago',
  warm: 'Morno',
  hot: 'Quente',
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
      {children}
    </p>
  )
}

function humanizeValue(value: string) {
  return valueLabels[value] ?? value
}

function humanizeConfigText(text: string) {
  if (text.includes('deve estar preenchido')) {
    return 'Precisa estar presente no diagnóstico'
  }
  if (text === 'Deve ser verdadeiro') {
    return 'Sinal precisa estar confirmado'
  }
  if (text === 'Qualquer valor numérico') {
    return 'Aceita qualquer valor definido'
  }
  return text
}

export function CriterionCard({ criterion, matchedCount, totalLeads, index }: Props) {
  const reduced = useReducedMotion()
  const config = formatCriterionConfig(criterion)
  const matchPct = totalLeads > 0 ? Math.round((matchedCount / totalLeads) * 100) : 0
  const fillColor = matchRateColor(matchPct)
  const tone = fieldTone[criterion.field] ?? {
    icon: ListChecks,
    reason: 'Critério ajuda a separar oportunidade real de curiosidade.',
  }
  const Icon = tone.icon

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary-muted text-primary">
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-semibold leading-tight text-text">
                {criterion.name}
              </h3>
              <Badge variant="secondary" className="font-mono tabular-nums">
                {criterion.weight} pts
              </Badge>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">
              {criterion.description || tone.reason}
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-md border border-border-subtle bg-background/35 px-3 py-2 sm:text-right">
          <MiniLabel>Leads que batem</MiniLabel>
          <p className="mt-1 font-display text-xl font-bold leading-none text-text">
            {matchedCount}
            <span className="ml-1 align-baseline text-xs font-medium text-text-secondary">
              / {totalLeads}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.45fr)]">
        <div className="min-w-0 rounded-md border border-border-subtle bg-background/30 p-3">
          <MiniLabel>Como pontua</MiniLabel>
          {config.kind === 'chips' ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {config.chips.filter(Boolean).map((chip) => (
                <Badge key={chip} variant="outline" className="max-w-full overflow-hidden text-ellipsis">
                  {humanizeValue(chip)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {humanizeConfigText(config.text)}
            </p>
          )}
        </div>

        <div className="min-w-0 rounded-md border border-border-subtle bg-background/30 p-3">
          <MiniLabel>Força no pipeline</MiniLabel>
          <div className="mt-3 flex items-center gap-3">
            <div
              role="progressbar"
              aria-label={`${criterion.name}: ${matchPct}% dos leads batem neste critério`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={matchPct}
              className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-border-subtle"
            >
              <motion.div
                className={cn('h-full rounded-full', fillColor)}
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: totalLeads > 0 ? matchPct / 100 : 0 }}
                style={{ transformOrigin: 'left center' }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : {
                        duration: 0.42,
                        ease: 'easeOut',
                        delay: index * 0.05,
                      }
                }
              />
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-text-secondary">
              {totalLeads > 0 ? `${matchPct}%` : '-'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
