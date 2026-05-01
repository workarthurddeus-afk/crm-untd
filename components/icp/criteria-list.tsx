'use client'

import { useMemo } from 'react'
import { Target } from 'lucide-react'
import { StaggerList, StaggerItem } from '@/components/motion/stagger'
import { EmptyState } from '@/components/shared/empty-state'
import { CriterionCard } from './criterion-card'
import { calculateICPScore } from '@/lib/services/scoring.service'
import type { ICPProfile, Lead } from '@/lib/types'

interface Props {
  profile: ICPProfile
  leads: Lead[]
}

export function CriteriaList({ profile, leads }: Props) {
  const sorted = useMemo(
    () => [...profile.criteria].sort((a, b) => b.weight - a.weight),
    [profile.criteria]
  )

  const matchCounts = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const criterion of profile.criteria) {
      counts[criterion.id] = 0
    }

    for (const lead of leads) {
      const breakdown = calculateICPScore(lead, profile)
      for (const result of breakdown.criteria) {
        if (result.positive) {
          counts[result.criterionId] = (counts[result.criterionId] ?? 0) + 1
        }
      }
    }

    return counts
  }, [leads, profile])

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Critérios de pontuação
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          Cada lead recebe pontos quando bate em um critério. Total: 100 pts.
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhum critério configurado."
          description="Configure critérios para começar a pontuar leads."
        />
      ) : (
        <StaggerList className="space-y-3">
          {sorted.map((criterion, i) => (
            <StaggerItem key={criterion.id}>
              <CriterionCard
                criterion={criterion}
                matchedCount={matchCounts[criterion.id] ?? 0}
                totalLeads={leads.length}
                index={i}
              />
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  )
}
