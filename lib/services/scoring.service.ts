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

function configList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : []
}

function normalizeText(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(' ').toLowerCase()
  return String(value ?? '').toLowerCase()
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
      const values = configList(config.values)
      const matched = values.includes(String(value))
      return {
        matchScore: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: ${String(value)} esta na lista`
          : `${criterion.name}: ${String(value ?? 'vazio')} fora da lista`,
      }
    }

    case 'array-overlap': {
      const values = configList(config.values).map((item) => item.toLowerCase())
      const sourceValues = Array.isArray(value)
        ? value.map((item) => String(item).toLowerCase())
        : [String(value ?? '').toLowerCase()]
      const matchedValues = sourceValues.filter((item) => values.includes(item))
      const matched = matchedValues.length > 0
      return {
        matchScore: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: encontrou ${matchedValues.join(', ')}`
          : `${criterion.name}: nenhum sinal encontrado`,
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

    case 'text-includes': {
      const keywords = configList(config.keywords ?? config.values).map((item) => item.toLowerCase())
      const text = normalizeText(value)
      const matchedKeywords = keywords.filter((keyword) => text.includes(keyword))
      const matched = matchedKeywords.length > 0
      return {
        matchScore: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: encontrou ${matchedKeywords.join(', ')}`
          : `${criterion.name}: sem palavra-chave esperada`,
      }
    }
  }
}

export function calculateICPScore(lead: Lead, profile: ICPProfile): ScoreBreakdown {
  const totalWeight = profile.criteria.reduce(
    (sum, criterion) => sum + Math.max(criterion.weight, 0),
    0,
  )
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
      positive: contribution > 0,
      explanation: evaluation.explanation,
    }
  })

  return {
    total: Math.min(
      100,
      Math.max(0, Math.round(criteria.reduce((sum, criterion) => sum + criterion.contribution, 0))),
    ),
    criteria,
  }
}

export function recalculateAllLeads(leads: Lead[], profile: ICPProfile): Lead[] {
  return leads.map((lead) => ({
    ...lead,
    icpScore: calculateICPScore(lead, profile).total,
  }))
}
