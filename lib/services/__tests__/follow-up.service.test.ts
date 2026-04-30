import { describe, expect, it } from 'vitest'
import {
  leadsNeedingFollowUpToday,
  leadsNeedingProposal,
  leadsStale,
} from '../follow-up.service'
import type { Lead, PipelineStage } from '@/lib/types'

const today = new Date('2026-04-29T12:00:00.000Z')

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-test',
    name: 'Lead Teste',
    company: 'Empresa Teste',
    niche: 'Nicho',
    origin: 'cold-dm',
    pipelineStageId: 'stage-first',
    temperature: 'cold',
    icpScore: 50,
    ownerId: 'arthur',
    tagIds: [],
    result: 'open',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('leadsNeedingFollowUpToday', () => {
  it('returns open leads due today or overdue', () => {
    const leads = [
      makeLead({ id: 'today', nextFollowUpAt: '2026-04-29T08:00:00.000Z' }),
      makeLead({ id: 'overdue', nextFollowUpAt: '2026-04-28T08:00:00.000Z' }),
      makeLead({ id: 'future', nextFollowUpAt: '2026-04-30T08:00:00.000Z' }),
    ]

    const result = leadsNeedingFollowUpToday(leads, today)

    expect(result.map((lead) => lead.id)).toEqual(['today', 'overdue'])
  })

  it('excludes closed leads', () => {
    const leads = [
      makeLead({ id: 'won', result: 'won', nextFollowUpAt: '2026-04-29T08:00:00.000Z' }),
      makeLead({ id: 'open', result: 'open', nextFollowUpAt: '2026-04-29T08:00:00.000Z' }),
    ]

    expect(leadsNeedingFollowUpToday(leads, today).map((lead) => lead.id)).toEqual(['open'])
  })
})

describe('leadsStale', () => {
  it('returns open leads older than the threshold', () => {
    const leads = [
      makeLead({ id: 'old', lastContactAt: '2026-04-15T00:00:00.000Z' }),
      makeLead({ id: 'recent', lastContactAt: '2026-04-25T00:00:00.000Z' }),
    ]

    expect(leadsStale(leads, 10, today).map((lead) => lead.id)).toEqual(['old'])
  })

  it('ignores closed leads and leads without last contact', () => {
    const leads = [
      makeLead({ id: 'lost', result: 'lost', lastContactAt: '2026-04-01T00:00:00.000Z' }),
      makeLead({ id: 'missing', lastContactAt: undefined }),
      makeLead({ id: 'open', result: 'open', lastContactAt: '2026-04-01T00:00:00.000Z' }),
    ]

    expect(leadsStale(leads, 10, today).map((lead) => lead.id)).toEqual(['open'])
  })
})

describe('leadsNeedingProposal', () => {
  const stages: PipelineStage[] = [
    { id: 'stage-first', name: 'Primeiro Contato', order: 2, color: '' },
    { id: 'stage-diagnosis', name: 'Diagnostico', order: 6, color: '' },
    { id: 'stage-proposal', name: 'Proposta', order: 7, color: '' },
    { id: 'stage-won', name: 'Ganho', order: 9, color: '', isFinalWon: true },
  ]

  it('returns high-ICP open leads before proposal stage', () => {
    const leads = [
      makeLead({ id: 'needs', icpScore: 85, pipelineStageId: 'stage-diagnosis' }),
      makeLead({ id: 'already-proposal', icpScore: 85, pipelineStageId: 'stage-proposal' }),
      makeLead({ id: 'low-score', icpScore: 79, pipelineStageId: 'stage-diagnosis' }),
      makeLead({ id: 'closed', icpScore: 90, result: 'won', pipelineStageId: 'stage-first' }),
    ]

    expect(leadsNeedingProposal(leads, stages, 80).map((lead) => lead.id)).toEqual(['needs'])
  })
})
