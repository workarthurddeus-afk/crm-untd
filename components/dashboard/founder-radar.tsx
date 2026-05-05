'use client'
import Link from 'next/link'
import { Radar, ArrowRight, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { FounderInsight } from '@/lib/utils/founder-insights'
import type { Lead } from '@/lib/types'

interface Props { insights: FounderInsight[]; opportunity: Lead | null }

export function FounderRadar({ insights, opportunity }: Props) {
  if (insights.length === 0 && !opportunity) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Radar className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Radar do Fundador</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {opportunity && (
          <Card className="p-4 group transition-colors duration-fast hover:border-primary/30">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                <Trophy className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text leading-tight">Melhor oportunidade</p>
                <p className="mt-1 text-xs text-text-muted leading-snug">
                  {opportunity.name} · {opportunity.company} · ICP {opportunity.icpScore}/100
                </p>
                <Link
                  href={`/leads/${opportunity.id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Ver lead <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                </Link>
              </div>
            </div>
          </Card>
        )}

        {insights.map((insight) => (
          <Card key={insight.id} className={cn('p-4 group transition-colors duration-fast hover:border-primary/30')}>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <insight.Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text leading-tight">{insight.title}</p>
                <p className="mt-1 text-xs text-text-muted leading-snug">{insight.description}</p>
                {insight.href && insight.ctaLabel && (
                  <Link
                    href={insight.href}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {insight.ctaLabel} <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
