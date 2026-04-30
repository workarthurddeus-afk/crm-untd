import { describe, expect, it } from 'vitest'
import { generateAlerts } from '../alerts.service'
import type { Feedback, Lead, PipelineStage, Task } from '@/lib/types'

const today = new Date('2026-04-29T12:00:00.000Z')

const pipeline: PipelineStage[] = [
  { id: 'stage-first', name: 'Primeiro Contato', order: 2, color: '' },
  { id: 'stage-diagnosis', name: 'Diagnostico', order: 6, color: '' },
  { id: 'stage-proposal', name: 'Proposta', order: 7, color: '' },
]

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

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-test',
    title: 'Tarefa teste',
    dueDate: '2026-04-20T00:00:00.000Z',
    importance: 'high',
    status: 'pending',
    category: 'follow-up',
    tagIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeFeedback(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: 'feedback-test',
    source: 'Cliente A',
    type: 'pain',
    content: 'Dor importante',
    date: '2026-04-20',
    impact: 'high',
    frequency: 'recurring',
    status: 'new',
    tagIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('generateAlerts', () => {
  it('flags follow-ups due today', () => {
    const alerts = generateAlerts({
      leads: [
        makeLead({ id: 'due', nextFollowUpAt: '2026-04-29T08:00:00.000Z' }),
        makeLead({ id: 'future', nextFollowUpAt: '2026-04-30T08:00:00.000Z' }),
      ],
      tasks: [],
      feedbacks: [],
      pipeline,
      today,
    })

    expect(alerts.find((alert) => alert.type === 'follow-ups-due-today')).toMatchObject({
      count: 1,
      leadIds: ['due'],
    })
  })

  it('flags stale leads', () => {
    const alerts = generateAlerts({
      leads: [makeLead({ id: 'stale', lastContactAt: '2026-04-01T00:00:00.000Z' })],
      tasks: [],
      feedbacks: [],
      pipeline,
      today,
    })

    expect(alerts.find((alert) => alert.type === 'leads-stale')).toMatchObject({
      count: 1,
      days: 10,
      leadIds: ['stale'],
    })
  })

  it('flags high-ICP leads before proposal', () => {
    const alerts = generateAlerts({
      leads: [makeLead({ id: 'high', icpScore: 90, pipelineStageId: 'stage-diagnosis' })],
      tasks: [],
      feedbacks: [],
      pipeline,
      today,
    })

    expect(alerts.find((alert) => alert.type === 'high-icp-no-proposal')).toMatchObject({
      count: 1,
      leadIds: ['high'],
    })
  })

  it('flags overdue tasks but ignores completed tasks', () => {
    const alerts = generateAlerts({
      leads: [],
      tasks: [
        makeTask({ id: 'overdue', dueDate: '2026-04-20T00:00:00.000Z', status: 'pending' }),
        makeTask({ id: 'done', dueDate: '2026-04-20T00:00:00.000Z', status: 'done' }),
      ],
      feedbacks: [],
      pipeline,
      today,
    })

    expect(alerts.find((alert) => alert.type === 'tasks-overdue')).toMatchObject({
      count: 1,
      taskIds: ['overdue'],
    })
  })

  it('flags high-impact unaddressed feedback', () => {
    const alerts = generateAlerts({
      leads: [],
      tasks: [],
      feedbacks: [
        makeFeedback({ id: 'new-high', impact: 'high', status: 'new' }),
        makeFeedback({ id: 'archived-high', impact: 'high', status: 'archived' }),
        makeFeedback({ id: 'new-low', impact: 'low', status: 'new' }),
      ],
      pipeline,
      today,
    })

    expect(alerts.find((alert) => alert.type === 'high-impact-feedback')).toMatchObject({
      count: 1,
      feedbackIds: ['new-high'],
    })
  })
})
