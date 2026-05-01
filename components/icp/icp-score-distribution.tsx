'use client'

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateICPScore } from '@/lib/services/scoring.service'
import { distributionBucketColor } from '@/lib/utils/icp-display'
import type { ICPProfile, Lead } from '@/lib/types'

interface Props {
  leads: Lead[]
  profile: ICPProfile
}

const BUCKETS = [
  { min: 0, max: 9, label: '0–9' },
  { min: 10, max: 19, label: '10–19' },
  { min: 20, max: 29, label: '20–29' },
  { min: 30, max: 39, label: '30–39' },
  { min: 40, max: 49, label: '40–49' },
  { min: 50, max: 59, label: '50–59' },
  { min: 60, max: 69, label: '60–69' },
  { min: 70, max: 79, label: '70–79' },
  { min: 80, max: 89, label: '80–89' },
  { min: 90, max: 100, label: '90–100' },
]

const X_AXIS_LABELS = ['0', '20', '40', '60', '80', '100']

export function ICPScoreDistribution({ leads, profile }: Props) {
  const reduced = useReducedMotion()

  const counts = useMemo(() => {
    if (leads.length === 0) return BUCKETS.map(() => 0)
    return BUCKETS.map(({ min, max }) =>
      leads.filter((l) => {
        const score = calculateICPScore(l, profile).total
        return score >= min && score <= max
      }).length
    )
  }, [leads, profile])

  const maxCount = Math.max(...counts, 1)

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        Distribuição de scores
      </p>

      <div className="mt-4 flex items-end gap-1 h-32">
        {counts.map((count, i) => {
          const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 2) : 0
          const colorClass = distributionBucketColor(i)

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className="flex-1 flex items-end h-full">
                  {count > 0 ? (
                    <motion.div
                      className={`w-full rounded-t-sm ${colorClass}`}
                      initial={reduced ? false : { height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : {
                              duration: 0.5,
                              ease: 'easeOut',
                              delay: i * 0.03,
                            }
                      }
                    />
                  ) : (
                    <div className="w-full bg-border" style={{ height: 1 }} />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {count} {count === 1 ? 'lead' : 'leads'} · score {BUCKETS[i]?.label ?? ''}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      <div className="mt-0.5 h-px bg-border" />

      <div className="mt-1 flex justify-between">
        {X_AXIS_LABELS.map((label) => (
          <span
            key={label}
            className="text-[10px] text-text-muted font-mono tabular-nums"
          >
            {label}
          </span>
        ))}
      </div>

      <p className="mt-3 text-right text-xs text-text-muted">
        {leads.length > 0
          ? `${leads.length} leads no total`
          : 'Sem leads'}
      </p>
    </Card>
  )
}
