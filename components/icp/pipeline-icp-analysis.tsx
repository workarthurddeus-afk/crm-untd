'use client'

import Link from 'next/link'
import { AlertTriangle, BarChart3, Layers3, ListChecks, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getPipelineICPAnalytics } from '@/lib/utils/icp-analytics'
import { cn } from '@/lib/utils/cn'
import type { ICPProfile, Lead } from '@/lib/types'

interface Props {
  profile: ICPProfile
  leads: Lead[]
}

function Meter({
  label,
  value,
  total,
  tone,
}: {
  label: string
  value: number
  total: number
  tone: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="rounded-lg border border-border-subtle bg-background/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text">{label}</p>
        <span className="font-mono text-xs tabular-nums text-text-secondary">{value}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-border-subtle">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function RankingList({
  title,
  icon: Icon,
  items,
  empty,
}: {
  title: string
  icon: React.ElementType
  items: Array<{ name: string; count: number }>
  empty: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
        <h3 className="font-display text-sm font-semibold text-text">{title}</h3>
      </div>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-sm text-text-secondary">{item.name}</span>
              <Badge variant="secondary" className="font-mono tabular-nums">
                {item.count}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm leading-relaxed text-text-secondary">{empty}</p>
        )}
      </div>
    </Card>
  )
}

export function PipelineICPAnalysis({ profile, leads }: Props) {
  const analytics = getPipelineICPAnalytics(leads, profile)
  const total = analytics.scoredLeads.length
  const top = analytics.topOpportunity

  return (
    <section aria-labelledby="pipeline-icp-analysis-title" className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Analise do pipeline
          </p>
          <h2 id="pipeline-icp-analysis-title" className="mt-1 font-display text-xl font-semibold tracking-tight text-text">
            Fit real contra o ICP alvo
          </h2>
        </div>
        <span className="text-xs font-medium text-text-secondary">
          {analytics.averageScore}% de score medio
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Meter label="Alto fit" value={analytics.distribution.high} total={total} tone="bg-success" />
        <Meter label="Possivel fit" value={analytics.distribution.possible} total={total} tone="bg-primary" />
        <Meter label="Fit fraco" value={analytics.distribution.weak} total={total} tone="bg-warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <RankingList
          title="Nichos no pipeline"
          icon={Layers3}
          items={analytics.topNiches}
          empty="Nenhum nicho aberto no pipeline."
        />
        <RankingList
          title="Atributos de alto fit"
          icon={ListChecks}
          items={analytics.highFitAttributes}
          empty="Ainda nao ha volume suficiente de leads com alto fit."
        />
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" strokeWidth={1.75} aria-hidden />
            <h3 className="font-display text-sm font-semibold text-text">Gargalos de aderencia</h3>
          </div>
          <div className="mt-4 space-y-3">
            {analytics.missingCriteria.length > 0 ? (
              analytics.missingCriteria.map((item) => (
                <div key={item.criterionId} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-text-secondary">{item.name}</span>
                  <Badge variant="outline" className="font-mono tabular-nums">
                    faltam {item.missingCount}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm leading-relaxed text-text-secondary">Nenhum gargalo relevante no recorte atual.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-success" strokeWidth={1.75} aria-hidden />
              <h3 className="font-display text-sm font-semibold text-text">Melhor oportunidade</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {top
                ? `${top.lead.company} combina maior score com potencial comercial no pipeline.`
                : 'Sem oportunidade aberta para ranquear.'}
            </p>
          </div>
          {top && (
            <Link
              href={`/leads/${top.lead.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary/25 bg-primary-muted px-4 text-sm font-medium text-primary transition-colors duration-fast hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Abrir lead ICP {top.score.total}
            </Link>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          <h3 className="font-display text-sm font-semibold text-text">Explicabilidade por lead</h3>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          {analytics.scoredLeads.slice(0, 6).map((item) => {
            const positives = item.score.criteria.filter((criterion) => criterion.contribution > 0)
            const negatives = item.score.criteria.filter((criterion) => criterion.contribution < 0)
            return (
              <div key={item.lead.id} className="rounded-lg border border-border-subtle bg-background/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{item.lead.company}</p>
                    <p className="mt-1 truncate text-xs text-text-secondary">{item.lead.niche}</p>
                  </div>
                  <Badge variant={item.score.total >= 80 ? 'success' : item.score.total >= 50 ? 'default' : 'outline'}>
                    {item.score.total}
                  </Badge>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Puxa para cima
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                  {positives.slice(0, 2).map((criterion) => criterion.name).join(' / ') || 'Sem sinais fortes.'}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Puxa para baixo
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                  {negatives.slice(0, 2).map((criterion) => criterion.name).join(' / ') || 'Sem red flag ativa.'}
                </p>
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
