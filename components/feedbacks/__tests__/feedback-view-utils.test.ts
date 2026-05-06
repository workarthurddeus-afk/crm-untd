import { describe, expect, it } from 'vitest'
import type { Feedback } from '@/lib/types'
import {
  buildFeedbackPayloadFromForm,
  filterFeedbacksForView,
  getDefaultFeedbackFormState,
  getFeedbackQuickStats,
  getLeadLabel,
} from '../feedback-view-utils'

const baseFeedback: Feedback = {
  id: 'feedback-1',
  title: 'Lead acha dificil manter consistencia visual',
  content: 'O lead comentou que cada post sai com uma cara diferente.',
  type: 'pain',
  source: 'lead',
  status: 'new',
  impact: 'medium',
  frequency: 'one_off',
  sentiment: 'negative',
  priority: 'medium',
  tags: ['brandkit'],
  isArchived: false,
  isPinned: false,
  createdAt: '2026-05-01T10:00:00.000Z',
  updatedAt: '2026-05-01T10:00:00.000Z',
  capturedAt: '2026-05-01T10:00:00.000Z',
}

function feedback(overrides: Partial<Feedback>): Feedback {
  return { ...baseFeedback, ...overrides }
}

describe('feedback-view-utils', () => {
  it('filters feedbacks by quick intelligence views', () => {
    const items = [
      feedback({ id: 'new', status: 'new' }),
      feedback({ id: 'critical', impact: 'critical', priority: 'urgent' }),
      feedback({ id: 'recurring', frequency: 'very_recurring' }),
      feedback({ id: 'sales', type: 'objection' }),
      feedback({ id: 'product', type: 'feature_request' }),
      feedback({ id: 'churn', type: 'churn_risk' }),
      feedback({ id: 'resolved', status: 'resolved' }),
      feedback({ id: 'archived', isArchived: true, status: 'archived' }),
    ]

    expect(filterFeedbacksForView(items, 'inbox').map((item) => item.id)).toEqual([
      'new',
      'critical',
      'recurring',
      'sales',
      'product',
      'churn',
    ])
    expect(filterFeedbacksForView(items, 'high-impact').map((item) => item.id)).toEqual([
      'critical',
    ])
    expect(filterFeedbacksForView(items, 'recurring').map((item) => item.id)).toEqual([
      'recurring',
    ])
    expect(filterFeedbacksForView(items, 'sales').map((item) => item.id)).toEqual(['sales', 'churn'])
    expect(filterFeedbacksForView(items, 'product').map((item) => item.id)).toEqual(['product'])
    expect(filterFeedbacksForView(items, 'churn').map((item) => item.id)).toEqual(['churn'])
    expect(filterFeedbacksForView(items, 'resolved').map((item) => item.id)).toEqual([
      'resolved',
    ])
    expect(filterFeedbacksForView(items, 'archived').map((item) => item.id)).toEqual([
      'archived',
    ])
  })

  it('builds a normalized feedback payload from the form', () => {
    const form = {
      ...getDefaultFeedbackFormState(),
      title: '  Pedido de templates por nicho  ',
      content: '  Social media pediu modelos para restaurantes.  ',
      type: 'feature_request' as const,
      source: 'meeting' as const,
      impact: 'high' as const,
      frequency: 'recurring' as const,
      sentiment: 'mixed' as const,
      priority: 'high' as const,
      tags: ' Produto, #Social Media,  restaurantes ',
      relatedLeadId: 'lead-1',
      capturedDate: '2026-05-06',
      capturedTime: '14:30',
      isPinned: true,
    }

    expect(buildFeedbackPayloadFromForm(form)).toEqual({
      title: 'Pedido de templates por nicho',
      content: 'Social media pediu modelos para restaurantes.',
      type: 'feature_request',
      source: 'meeting',
      status: 'new',
      impact: 'high',
      frequency: 'recurring',
      sentiment: 'mixed',
      priority: 'high',
      tags: ['produto', 'social-media', 'restaurantes'],
      relatedLeadId: 'lead-1',
      isArchived: false,
      isPinned: true,
      capturedAt: '2026-05-06T14:30:00.000Z',
    })
  })

  it('calculates compact stats for the feedback command center', () => {
    const stats = getFeedbackQuickStats([
      feedback({ id: 'new', status: 'new' }),
      feedback({ id: 'critical', status: 'reviewing', impact: 'critical' }),
      feedback({ id: 'recurring', status: 'reviewing', frequency: 'recurring' }),
      feedback({ id: 'churn', status: 'reviewing', type: 'churn_risk' }),
      feedback({ id: 'product', status: 'reviewing', type: 'bug' }),
      feedback({ id: 'archived', isArchived: true, status: 'archived' }),
    ])

    expect(stats).toEqual({
      new: 1,
      highImpact: 1,
      recurring: 1,
      churnRisks: 1,
      productSignals: 1,
    })
  })

  it('resolves lead labels when a relation exists', () => {
    expect(
      getLeadLabel('lead-1', [
        { id: 'lead-1', name: 'Lara Castelo', company: 'Clínica Renove' } as never,
      ])
    ).toBe('Lara Castelo · Clínica Renove')
    expect(getLeadLabel(null, [])).toBeNull()
  })
})
