import { describe, expect, it } from 'vitest'
import { calculateICPScore, recalculateAllLeads } from '../scoring.service'
import { getPipelineICPAnalytics } from '@/lib/utils/icp-analytics'
import type { ICPProfile, Lead } from '@/lib/types'

const baseProfile: ICPProfile = {
  id: 'profile-test',
  name: 'Profile Test',
  criteria: [
    {
      id: 'crit-niche',
      name: 'Nicho prioritario',
      weight: 40,
      field: 'niche',
      evaluator: 'array-includes',
      config: { values: ['Agencia de social media', 'Agencia de trafego'] },
    },
    {
      id: 'crit-revenue',
      name: 'Receita qualificada',
      weight: 30,
      field: 'revenuePotential',
      evaluator: 'numeric-range',
      config: { min: 3000, max: 10000 },
    },
    {
      id: 'crit-pain',
      name: 'Dor preenchida',
      weight: 30,
      field: 'pain',
      evaluator: 'string-not-empty',
      config: {},
    },
  ],
  persona: {
    name: 'Persona',
    description: 'Persona teste',
    pains: [],
    desires: [],
    objections: [],
    purchaseTriggers: [],
    foundOnChannels: [],
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-test',
    name: 'Lead Teste',
    company: 'Empresa Teste',
    niche: 'Outro',
    origin: 'cold-dm',
    pipelineStageId: 'stage-first',
    temperature: 'cold',
    icpScore: 0,
    ownerId: 'arthur',
    tagIds: [],
    result: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('calculateICPScore', () => {
  it('returns 0 when no criteria match', () => {
    const result = calculateICPScore(makeLead({ revenuePotential: 1000, pain: '' }), baseProfile)

    expect(result.total).toBe(0)
    expect(result.criteria.every((criterion) => criterion.matchScore === 0)).toBe(true)
  })

  it('returns 100 when all weighted criteria match', () => {
    const result = calculateICPScore(
      makeLead({
        niche: 'Agencia de social media',
        revenuePotential: 5000,
        pain: 'Precisa escalar criativos.',
      }),
      baseProfile
    )

    expect(result.total).toBe(100)
    expect(result.criteria.reduce((sum, criterion) => sum + criterion.contribution, 0)).toBe(100)
  })

  it('normalizes score by total weight', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        { id: 'a', name: 'A', weight: 10, field: 'pain', evaluator: 'string-not-empty', config: {} },
        { id: 'b', name: 'B', weight: 30, field: 'website', evaluator: 'string-not-empty', config: {} },
      ],
    }

    const result = calculateICPScore(makeLead({ pain: 'dor', website: '' }), profile)

    expect(result.total).toBe(25)
  })

  it('handles enum-match exactly', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        {
          id: 'origin',
          name: 'Origem paga',
          weight: 100,
          field: 'origin',
          evaluator: 'enum-match',
          config: { value: 'paid-traffic' },
        },
      ],
    }

    expect(calculateICPScore(makeLead({ origin: 'paid-traffic' }), profile).total).toBe(100)
    expect(calculateICPScore(makeLead({ origin: 'cold-dm' }), profile).total).toBe(0)
  })

  it('handles numeric-range with inclusive bounds', () => {
    const atMin = calculateICPScore(makeLead({ revenuePotential: 3000 }), baseProfile)
    const atMax = calculateICPScore(makeLead({ revenuePotential: 10000 }), baseProfile)
    const outside = calculateICPScore(makeLead({ revenuePotential: 10001 }), baseProfile)

    expect(atMin.criteria.find((criterion) => criterion.criterionId === 'crit-revenue')?.matchScore).toBe(1)
    expect(atMax.criteria.find((criterion) => criterion.criterionId === 'crit-revenue')?.matchScore).toBe(1)
    expect(outside.criteria.find((criterion) => criterion.criterionId === 'crit-revenue')?.matchScore).toBe(0)
  })

  it('reads nested fields through dot notation', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        {
          id: 'city',
          name: 'Cidade preenchida',
          weight: 100,
          field: 'location.city',
          evaluator: 'string-not-empty',
          config: {},
        },
      ],
    }

    expect(calculateICPScore(makeLead({ location: { city: 'Sao Paulo' } }), profile).total).toBe(100)
    expect(calculateICPScore(makeLead({ location: undefined }), profile).total).toBe(0)
  })

  it('handles boolean-true evaluators', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        {
          id: 'qualified',
          name: 'Qualificado manualmente',
          weight: 100,
          field: 'qualifiedManually',
          evaluator: 'boolean-true',
          config: {},
        },
      ],
    }
    const qualified = { ...makeLead(), qualifiedManually: true }
    const unqualified = { ...makeLead(), qualifiedManually: false }

    expect(calculateICPScore(qualified, profile).total).toBe(100)
    expect(calculateICPScore(unqualified, profile).total).toBe(0)
  })

  it('supports text-includes and array-overlap signals for operational ICP rules', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        {
          id: 'volume',
          name: 'Volume de criativos',
          weight: 45,
          field: 'pain',
          evaluator: 'text-includes',
          config: { keywords: ['criativos', 'volume'] },
        },
        {
          id: 'tags',
          name: 'Sinais de recorrencia',
          weight: 55,
          field: 'tagIds',
          evaluator: 'array-overlap',
          config: { values: ['recorrencia', 'meta-ads'] },
        },
      ],
    }

    const result = calculateICPScore(
      makeLead({
        pain: 'Precisa aumentar volume de criativos toda semana.',
        tagIds: ['meta-ads'],
      }),
      profile,
    )

    expect(result.total).toBe(100)
    expect(result.criteria.every((criterion) => criterion.positive)).toBe(true)
  })

  it('applies negative red-flag criteria without making totals unstable', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        {
          id: 'pain',
          name: 'Dor clara',
          weight: 100,
          field: 'pain',
          evaluator: 'string-not-empty',
          config: {},
        },
        {
          id: 'red-price',
          name: 'Red flag de preco',
          weight: -35,
          field: 'objections',
          evaluator: 'array-overlap',
          config: { values: ['preco'] },
        },
      ],
    }

    const result = calculateICPScore(
      makeLead({ pain: 'Precisa escalar criativos.', objections: ['preco'] }),
      profile,
    )

    expect(result.total).toBe(65)
    expect(result.criteria.find((criterion) => criterion.criterionId === 'red-price')?.positive).toBe(false)
    expect(result.criteria.find((criterion) => criterion.criterionId === 'red-price')?.contribution).toBeLessThan(0)
  })

  it('returns explanations and rounded integer totals', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        { id: 'a', name: 'A', weight: 33, field: 'pain', evaluator: 'string-not-empty', config: {} },
        { id: 'b', name: 'B', weight: 67, field: 'website', evaluator: 'string-not-empty', config: {} },
      ],
    }

    const result = calculateICPScore(makeLead({ pain: 'dor', website: '' }), profile)

    expect(result.total).toBe(33)
    expect(Number.isInteger(result.total)).toBe(true)
    expect(result.criteria.every((criterion) => criterion.explanation.length > 0)).toBe(true)
  })
})

describe('getPipelineICPAnalytics', () => {
  it('summarizes pipeline fit, missing criteria, niches and top opportunity', () => {
    const leads = [
      makeLead({
        id: 'lead-high',
        company: 'Alta Fit',
        niche: 'Agencia de social media',
        revenuePotential: 7000,
        pain: 'Precisa escalar criativos.',
        tagIds: ['meta-ads'],
      }),
      makeLead({
        id: 'lead-possible',
        company: 'Possivel Fit',
        niche: 'Agencia de trafego',
        revenuePotential: 2000,
        pain: 'Precisa de design.',
        tagIds: [],
      }),
      makeLead({
        id: 'lead-weak',
        company: 'Fit Fraco',
        niche: 'Outro',
        revenuePotential: 800,
        pain: '',
        tagIds: ['baixo-fit'],
      }),
    ]

    const analytics = getPipelineICPAnalytics(leads, baseProfile)

    expect(analytics.averageScore).toBeGreaterThan(0)
    expect(analytics.distribution.high).toBe(1)
    expect(analytics.distribution.possible).toBe(1)
    expect(analytics.distribution.weak).toBe(1)
    expect(analytics.topOpportunity?.lead.id).toBe('lead-high')
    expect(analytics.topNiches[0]?.name).toBe('Agencia de social media')
    expect(analytics.missingCriteria[0]?.criterionId).toBeTruthy()
  })
})

describe('recalculateAllLeads', () => {
  it('returns copies of every lead with recalculated icpScore', () => {
    const leads = [
      makeLead({ id: 'lead-a', niche: 'Agencia de trafego', revenuePotential: 6000, pain: 'dor', icpScore: 0 }),
      makeLead({ id: 'lead-b', niche: 'Outro', revenuePotential: 1000, pain: '', icpScore: 80 }),
    ]

    const next = recalculateAllLeads(leads, baseProfile)

    expect(next[0]?.icpScore).toBe(100)
    expect(next[1]?.icpScore).toBe(0)
    expect(next[0]).not.toBe(leads[0])
  })
})
