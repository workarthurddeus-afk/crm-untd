import { beforeEach, describe, expect, it } from 'vitest'
import { feedbacksRepo } from '../feedbacks.repository'

describe('feedbacksRepo', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await feedbacksRepo.seedDemoData()
  })

  it('starts empty until demo feedbacks are loaded explicitly', async () => {
    await feedbacksRepo.clear()
    await expect(feedbacksRepo.listFeedbacks()).resolves.toEqual([])
  })

  it('lists active feedbacks by default and excludes archived feedbacks', async () => {
    const feedbacks = await feedbacksRepo.listFeedbacks()

    expect(feedbacks.length).toBeGreaterThanOrEqual(24)
    expect(feedbacks.every((feedback) => !feedback.isArchived)).toBe(true)
    expect(feedbacks.some((feedback) => feedback.status === 'archived')).toBe(false)
  })

  it('creates and updates feedback with normalized tags', async () => {
    const created = await feedbacksRepo.createFeedback({
      title: 'Lead pediu aprovacao por cliente',
      content: 'Social media quer mandar criativos para aprovacao antes de exportar.',
      type: 'feature_request',
      source: 'call',
      status: 'new',
      impact: 'high',
      frequency: 'recurring',
      sentiment: 'neutral',
      priority: 'high',
      tags: [' Social Media ', 'Aprovacao'],
      relatedLeadId: 'lead-001',
      isArchived: false,
      isPinned: true,
      capturedAt: '2026-05-05T14:00:00.000Z',
    })

    const updated = await feedbacksRepo.updateFeedback(created.id, {
      priority: 'urgent',
      tags: ['social-media', 'cliente'],
    })

    expect(created).toMatchObject({
      title: 'Lead pediu aprovacao por cliente',
      tags: ['social-media', 'aprovacao'],
      isPinned: true,
    })
    expect(updated).toMatchObject({
      priority: 'urgent',
      tags: ['social-media', 'cliente'],
    })
  })

  it('archives, restores, resolves, reopens, pins and unpins feedback', async () => {
    const target = (await feedbacksRepo.listFeedbacks())[0]!

    const archived = await feedbacksRepo.archiveFeedback(target.id)
    expect(archived.isArchived).toBe(true)
    expect(archived.status).toBe('archived')

    const restored = await feedbacksRepo.unarchiveFeedback(target.id)
    expect(restored.isArchived).toBe(false)
    expect(restored.status).toBe('new')

    const resolved = await feedbacksRepo.resolveFeedback(target.id, '2026-05-06T12:00:00.000Z')
    expect(resolved.status).toBe('resolved')
    expect(resolved.resolvedAt).toBe('2026-05-06T12:00:00.000Z')

    const reopened = await feedbacksRepo.reopenFeedback(target.id)
    expect(reopened.status).toBe('reviewing')
    expect(reopened.resolvedAt).toBeNull()

    await expect(feedbacksRepo.pinFeedback(target.id)).resolves.toMatchObject({ isPinned: true })
    await expect(feedbacksRepo.unpinFeedback(target.id)).resolves.toMatchObject({ isPinned: false })
  })

  it('hard deletes feedback permanently', async () => {
    const target = (await feedbacksRepo.listFeedbacks())[0]!

    await feedbacksRepo.deleteFeedback(target.id)

    await expect(feedbacksRepo.getFeedbackById(target.id)).resolves.toBeNull()
  })

  it('filters by type, status, impact, frequency, sentiment and priority', async () => {
    const filtered = await feedbacksRepo.filterFeedbacks({
      type: 'feature_request',
      impact: 'high',
      frequency: 'recurring',
      sentiment: 'neutral',
      priority: 'high',
    })

    expect(filtered.length).toBeGreaterThan(0)
    expect(
      filtered.every(
        (feedback) =>
          feedback.type === 'feature_request' &&
          feedback.impact === 'high' &&
          feedback.frequency === 'recurring' &&
          feedback.sentiment === 'neutral' &&
          feedback.priority === 'high'
      )
    ).toBe(true)
  })

  it('searches title, content and tags and retrieves feedbacks by relation', async () => {
    const search = await feedbacksRepo.searchFeedbacks('brandkit')
    const byLead = await feedbacksRepo.getFeedbacksByLeadId('lead-001')

    expect(search.length).toBeGreaterThan(0)
    expect(
      search.every((feedback) =>
        [feedback.title, feedback.content, ...feedback.tags].join(' ').toLowerCase().includes('brandkit')
      )
    ).toBe(true)
    expect(byLead.length).toBeGreaterThan(0)
    expect(byLead.every((feedback) => feedback.relatedLeadId === 'lead-001')).toBe(true)
  })
})
