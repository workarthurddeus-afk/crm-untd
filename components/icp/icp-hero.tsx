'use client'

import { useMemo } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { ArrowUpRight, Crosshair, Gauge, Target, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { calculateICPScore } from '@/lib/services/scoring.service'
import { cn } from '@/lib/utils/cn'
import type { ICPProfile, Lead } from '@/lib/types'

interface Props {
  profile: ICPProfile
  leads: Lead[]
}

interface SignalTileProps {
  label: string
  value: string
  detail: string
  tone?: 'primary' | 'success' | 'warning'
}

function SignalTile({ label, value, detail, tone = 'primary' }: SignalTileProps) {
  const textTone = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
  }[tone]

  return (
    <div className="min-w-0 rounded-md border border-border-subtle bg-background/35 p-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn('font-display text-2xl font-bold leading-none', textTone)}>
          {value}
        </span>
        <span className="min-w-0 truncate text-xs text-text-secondary">{detail}</span>
      </div>
    </div>
  )
}

function relativeDate(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true })
  } catch {
    return '-'
  }
}

function currency(value?: number): string {
  if (!value) return 'sem potencial definido'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ICPHero({ profile, leads }: Props) {
  const radar = useMemo(() => {
    const scored = leads
      .map((lead) => ({ lead, score: calculateICPScore(lead, profile).total }))
      .sort((a, b) => b.score - a.score || (b.lead.revenuePotential ?? 0) - (a.lead.revenuePotential ?? 0))

    const totalWeight = profile.criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
    const mainLever = [...profile.criteria].sort((a, b) => b.weight - a.weight)[0]
    const avgScore = scored.length
      ? Math.round(scored.reduce((sum, item) => sum + item.score, 0) / scored.length)
      : 0
    const highFit = scored.filter((item) => item.score >= 80)
    const aligned = scored.filter((item) => item.score >= 70)
    const weakFit = scored.filter((item) => item.score < 50)
    const topLead = scored[0]

    const priority =
      highFit.length > 0
        ? `${highFit.length} lead${highFit.length === 1 ? '' : 's'} com fit alto pronto para ataque.`
        : aligned.length > 0
          ? `${aligned.length} lead${aligned.length === 1 ? '' : 's'} perto do fit ideal.`
          : 'Pipeline precisa de leads mais alinhados ao perfil.'

    const nextMove =
      topLead && topLead.score >= 70
        ? `Comece por ${topLead.lead.company}: ICP ${topLead.score}/100 e ${currency(topLead.lead.revenuePotential)} de potencial.`
        : weakFit.length > aligned.length
          ? 'Refine prospecção antes de aumentar volume: o pipeline ainda está abaixo do ICP.'
          : 'Use os critérios de maior peso para decidir o próximo follow-up.'

    return {
      avgScore,
      highFit: highFit.length,
      aligned: aligned.length,
      weakFit: weakFit.length,
      totalWeight,
      mainLever,
      priority,
      nextMove,
      topLead,
    }
  }, [leads, profile])

  return (
    <Card className="overflow-hidden border-primary/20 bg-surface">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="border-primary/20 bg-primary-muted text-primary">
              Radar de fit
            </Badge>
            <span className="text-xs text-text-secondary">
              Atualizado {relativeDate(profile.updatedAt)}
            </span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.64fr)_minmax(260px,0.36fr)] lg:items-end">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Prioridade comercial
              </p>
              <h2 className="mt-2 max-w-3xl font-display text-2xl font-bold leading-tight tracking-tight text-text sm:text-3xl">
                {radar.priority}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                {profile.description}
              </p>
            </div>

            <div className="rounded-lg border border-border-subtle bg-background/35 p-4">
              <div className="flex items-center gap-2 text-primary">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                  Próximo movimento
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text">
                {radar.nextMove}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SignalTile
              label="Score médio"
              value={leads.length > 0 ? String(radar.avgScore) : '-'}
              detail="/100 no pipeline"
              tone={radar.avgScore >= 70 ? 'success' : radar.avgScore >= 50 ? 'primary' : 'warning'}
            />
            <SignalTile
              label="Alto fit"
              value={String(radar.highFit)}
              detail={`de ${leads.length} leads`}
              tone="success"
            />
            <SignalTile
              label="Fit fraco"
              value={String(radar.weakFit)}
              detail="pedem triagem"
              tone="warning"
            />
          </div>
        </div>

        <aside className="border-t border-border-subtle bg-background/25 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 text-text-secondary">
            <Gauge className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Modelo ativo
            </p>
          </div>
          <p className="mt-3 font-display text-xl font-semibold leading-tight text-text">
            {profile.name}
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary">
                <Crosshair className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">Alavanca principal</p>
                <p className="mt-1 text-sm leading-snug text-text-secondary">
                  {radar.mainLever?.name ?? 'Sem critério dominante'} · {radar.mainLever?.weight ?? 0} pts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                <Users className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">Leads alinhados</p>
                <p className="mt-1 text-sm leading-snug text-text-secondary">
                  {radar.aligned} acima de 70 pontos · {radar.totalWeight} pts no modelo
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning/10 text-warning">
                <Target className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">Melhor oportunidade</p>
                <p className="mt-1 text-sm leading-snug text-text-secondary">
                  {radar.topLead ? `${radar.topLead.lead.company} · ICP ${radar.topLead.score}` : 'Sem leads para ranquear'}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Card>
  )
}
