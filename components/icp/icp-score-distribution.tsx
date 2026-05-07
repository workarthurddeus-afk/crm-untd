'use client'

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateICPScore } from '@/lib/services/scoring.service'
import { distributionBucketColor } from '@/lib/utils/icp-display'
import type { ICPProfile, Lead } from '@/lib/types'

interface Props {
  leads: Lead[]
  profile: ICPProfile
}

const BUCKETS = [
  { min: 0, max: 9, label: '0-9' },
  { min: 10, max: 19, label: '10-19' },
  { min: 20, max: 29, label: '20-29' },
  { min: 30, max: 39, label: '30-39' },
  { min: 40, max: 49, label: '40-49' },
  { min: 50, max: 59, label: '50-59' },
  { min: 60, max: 69, label: '60-69' },
  { min: 70, max: 79, label: '70-79' },
  { min: 80, max: 89, label: '80-89' },
  { min: 90, max: 100, label: '90-100' },
]

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border-subtle bg-background/30 px-3 py-2">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold leading-none text-text">
        {value}
      </p>
    </div>
  )
}

export function ICPScoreDistribution({ leads, profile }: Props) {
  const reduced = useReducedMotion()

  const distribution = useMemo(() => {
    const scores = leads.map((lead) => calculateICPScore(lead, profile).total)
    const counts = BUCKETS.map(({ min, max }) =>
      scores.filter((score) => score >= min && score <= max).length
    )

    return {
      counts,
      highFit: scores.filter((score) => score >= 80).length,
      possibleFit: scores.filter((score) => score >= 50 && score < 80).length,
      weakFit: scores.filter((score) => score < 50).length,
    }
  }, [leads, profile])

  const maxCount = Math.max(...distribution.counts, 1)

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Distribuição de fit
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            Onde o pipeline concentra energia boa e onde existe ruído.
          </p>
        </div>
        <span className="shrink-0 rounded-sm border border-border-subtle bg-background/40 px-2 py-1 font-mono text-xs text-text-secondary">
          {leads.length} leads
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <SummaryPill label="Alto fit" value={distribution.highFit} />
        <SummaryPill label="Possível fit" value={distribution.possibleFit} />
        <SummaryPill label="Fit fraco" value={distribution.weakFit} />
      </div>

      <TooltipProvider delayDuration={120}>
        <div
          role="img"
          aria-label="Distribuição de score ICP dos leads"
          className="mt-5"
        >
          <div className="flex h-36 items-end gap-1.5">
            {distribution.counts.map((count, i) => {
              const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 3) : 2
              const colorClass = distributionBucketColor(i)

              return (
                <Tooltip key={BUCKETS[i]?.label ?? i}>
                  <TooltipTrigger asChild>
                    <div className="flex h-full min-w-0 flex-1 items-end rounded-t-sm focus-within:outline-none">
                      <motion.div
                        className={`w-full origin-bottom rounded-t-sm ${count > 0 ? colorClass : 'bg-border-subtle'}`}
                        style={{ height: `${heightPct}%` }}
                        initial={reduced ? false : { opacity: 0, scaleY: 0.72 }}
                        animate={{ opacity: count > 0 ? 1 : 0.65, scaleY: 1 }}
                        transition={
                          reduced
                            ? { duration: 0 }
                            : {
                                duration: 0.34,
                                ease: 'easeOut',
                                delay: i * 0.025,
                              }
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {count} {count === 1 ? 'lead' : 'leads'} · ICP {BUCKETS[i]?.label ?? ''}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </TooltipProvider>

      <div className="mt-2 grid grid-cols-3 text-[0.68rem] font-medium text-text-secondary">
        <span>0</span>
        <span className="text-center">50</span>
        <span className="text-right">100</span>
      </div>
    </Card>
  )
}
