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
    <section aria-labelledby="icp-criteria-title">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Alavancas de match
          </p>
          <h2 id="icp-criteria-title" className="mt-1 font-display text-xl font-semibold tracking-tight text-text">
            O que faz um lead subir no ranking
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">
            Os sinais que explicam por que uma conversa merece prioridade agora.
          </p>
        </div>
        <p className="text-xs font-medium text-text-secondary">
          Modelo com 100 pts
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhum critério configurado."
          description="Crie sinais de fit para começar a priorizar leads."
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
    </section>
  )
}
