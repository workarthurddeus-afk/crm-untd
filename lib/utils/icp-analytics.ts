import { calculateICPScore } from '@/lib/services/scoring.service'
import type { ICPCriterionResult, ICPProfile, Lead, ScoreBreakdown } from '@/lib/types'

export interface PipelineICPDistribution {
  high: number
  possible: number
  weak: number
}

export interface PipelineICPAnalytics {
  scoredLeads: Array<{ lead: Lead; score: ScoreBreakdown }>
  averageScore: number
  alignedCount: number
  distribution: PipelineICPDistribution
  topNiches: Array<{ name: string; count: number }>
  highFitAttributes: Array<{ name: string; count: number }>
  missingCriteria: Array<{ criterionId: string; name: string; missingCount: number; weight: number }>
  topOpportunity: { lead: Lead; score: ScoreBreakdown } | null
}

function isOpenPipelineLead(lead: Lead): boolean {
  return lead.result === 'open'
}

function addCount(map: Map<string, number>, key: string | undefined) {
  const clean = key?.trim()
  if (!clean) return
  map.set(clean, (map.get(clean) ?? 0) + 1)
}

function topCounts(map: Map<string, number>, limit: number) {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}

function positiveHighValueCriteria(criteria: ICPCriterionResult[]): ICPCriterionResult[] {
  return criteria
    .filter((criterion) => criterion.positive && criterion.weight > 0)
    .sort((a, b) => b.contribution - a.contribution)
}

export function getPipelineICPAnalytics(
  leads: Lead[],
  profile: ICPProfile,
): PipelineICPAnalytics {
  const pipelineLeads = leads.filter(isOpenPipelineLead)
  const scoredLeads = pipelineLeads
    .map((lead) => ({ lead, score: calculateICPScore(lead, profile) }))
    .sort((a, b) => b.score.total - a.score.total || (b.lead.revenuePotential ?? 0) - (a.lead.revenuePotential ?? 0))

  const averageScore = scoredLeads.length
    ? Math.round(scoredLeads.reduce((sum, item) => sum + item.score.total, 0) / scoredLeads.length)
    : 0

  const high = scoredLeads.filter((item) => item.score.total >= 80).length
  const possible = scoredLeads.filter((item) => item.score.total >= 50 && item.score.total < 80).length
  const weak = scoredLeads.filter((item) => item.score.total < 50).length

  const nicheCounts = new Map<string, number>()
  for (const { lead } of scoredLeads) {
    addCount(nicheCounts, lead.niche)
  }

  const highFitAttributeCounts = new Map<string, number>()
  for (const item of scoredLeads.filter((scored) => scored.score.total >= 80)) {
    for (const criterion of positiveHighValueCriteria(item.score.criteria).slice(0, 3)) {
      addCount(highFitAttributeCounts, criterion.name)
    }
  }

  const missingByCriterion = new Map<string, { name: string; missingCount: number; weight: number }>()
  for (const item of scoredLeads) {
    for (const criterion of item.score.criteria) {
      if (criterion.weight <= 0 || criterion.matchScore > 0) continue
      const current = missingByCriterion.get(criterion.criterionId) ?? {
        name: criterion.name,
        missingCount: 0,
        weight: criterion.weight,
      }
      current.missingCount += 1
      missingByCriterion.set(criterion.criterionId, current)
    }
  }

  return {
    scoredLeads,
    averageScore,
    alignedCount: scoredLeads.filter((item) => item.score.total >= 70).length,
    distribution: { high, possible, weak },
    topNiches: topCounts(nicheCounts, 5),
    highFitAttributes: topCounts(highFitAttributeCounts, 5),
    missingCriteria: [...missingByCriterion.entries()]
      .map(([criterionId, value]) => ({ criterionId, ...value }))
      .sort((a, b) => b.missingCount - a.missingCount || b.weight - a.weight)
      .slice(0, 5),
    topOpportunity: scoredLeads[0] ?? null,
  }
}
