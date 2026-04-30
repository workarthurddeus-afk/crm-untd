import type { ICPCriterion, ICPCriterionResult, ICPProfile, Lead, ScoreBreakdown } from '@/lib/types'

function readPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, source)
}

function asNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number.NaN
}

function numericConfigValue(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback
}

function evaluateCriterion(lead: Lead, criterion: ICPCriterion): { matchScore: number; explanation: string } {
  const value = readPath(lead, criterion.field)
  const config = criterion.config

  switch (criterion.evaluator) {
    case 'enum-match': {
      const target = config.value
      const matched = value === target
      return {
        matchScore: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: match em ${String(value)}`
          : `${criterion.name}: esperado ${String(target)}, recebido ${String(value ?? 'vazio')}`,
      }
    }

    case 'array-includes': {
      const values = Array.isArray(config.values) ? config.values : []
      const matched = values.includes(value)
      return {
        matchScore: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: ${String(value)} esta na lista`
          : `${criterion.name}: ${String(value ?? 'vazio')} fora da lista`,
      }
    }

    case 'numeric-range': {
      const min = numericConfigValue(config.min, Number.NEGATIVE_INFINITY)
      const max = numericConfigValue(config.max, Number.POSITIVE_INFINITY)
      const numberValue = asNumber(value)
      const matched = Number.isFinite(numberValue) && numberValue >= min && numberValue <= max
      return {
        matchScore: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: ${numberValue} dentro do range`
          : `${criterion.name}: ${Number.isFinite(numberValue) ? numberValue : 'vazio'} fora do range`,
      }
    }

    case 'boolean-true': {
      const matched = value === true
      return {
        matchScore: matched ? 1 : 0,
        explanation: matched ? `${criterion.name}: verdadeiro` : `${criterion.name}: falso`,
      }
    }

    case 'string-not-empty': {
      const matched = typeof value === 'string' && value.trim().length > 0
      return {
        matchScore: matched ? 1 : 0,
        explanation: matched ? `${criterion.name}: preenchido` : `${criterion.name}: vazio`,
      }
    }
  }
}

export function calculateICPScore(lead: Lead, profile: ICPProfile): ScoreBreakdown {
  const totalWeight = profile.criteria.reduce((sum, criterion) => sum + criterion.weight, 0)
  const denominator = totalWeight > 0 ? totalWeight : 1

  const criteria: ICPCriterionResult[] = profile.criteria.map((criterion) => {
    const evaluation = evaluateCriterion(lead, criterion)
    const contribution = (criterion.weight / denominator) * 100 * evaluation.matchScore

    return {
      criterionId: criterion.id,
      name: criterion.name,
      weight: criterion.weight,
      matchScore: evaluation.matchScore,
      contribution,
      positive: evaluation.matchScore > 0,
      explanation: evaluation.explanation,
    }
  })

  return {
    total: Math.round(criteria.reduce((sum, criterion) => sum + criterion.contribution, 0)),
    criteria,
  }
}

export function recalculateAllLeads(leads: Lead[], profile: ICPProfile): Lead[] {
  return leads.map((lead) => ({
    ...lead,
    icpScore: calculateICPScore(lead, profile).total,
  }))
}
