import { beforeEach, describe, expect, it } from 'vitest'
import { feedbacksRepo } from '@/lib/repositories/feedbacks.repository'
import {
  convertFeedbackToNotePayload,
  convertFeedbackToTaskPayload,
  createFeedback,
  getChurnRisks,
  getFeedbackDashboardSummary,
  getFeedbackStats,
  getFeedbacksByLead,
  getHighImpactFeedback,
  getProductSignals,
  getRecurringFeedback,
  getSalesObjections,
  getTopFeedbackPatterns,
  getUnresolvedFeedback,
  resolveFeedback,
} from '../feedbacks.service'

describe('feedbacks.service', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await feedbacksRepo.seedDemoData()
  })

  it('creates feedback through schema validation and keeps unresolved inbox active', async () => {
    const created = await createFeedback({
      title: 'Restaurante quer promocoes semanais',
      content: 'Dono de restaurante pediu posts promocionais com cardapio e oferta da semana.',
      type: 'product_insight',
      source: 'meeting',
      status: 'new',
      impact: 'high',
      frequency: 'recurring',
      sentiment: 'mixed',
      priority: 'high',
      tags: ['restaurante', 'promocao'],
      relatedLeadId: 'lead-001',
      isArchived: false,
      isPinned: false,
      capturedAt: '2026-05-05T10:00:00.000Z',
    })
    const unresolved = await getUnresolvedFeedback()

    expect(created.tags).toEqual(['restaurante', 'promocao'])
    expect(unresolved.map((feedback) => feedback.id)).toContain(created.id)
  })

  it('resolves feedback and removes it from unresolved feedback', async () => {
    const target = (await getUnresolvedFeedback())[0]!
    const resolved = await resolveFeedback(target.id, '2026-05-06T12:00:00.000Z')
    const unresolved = await getUnresolvedFeedback()

    expect(resolved.status).toBe('resolved')
    expect(resolved.resolvedAt).toBe('2026-05-06T12:00:00.000Z')
    expect(unresolved.map((feedback) => feedback.id)).not.toContain(target.id)
  })

  it('returns high-impact, recurring, product and sales signals ordered for review', async () => {
    const highImpact = await getHighImpactFeedback()
    const recurring = await getRecurringFeedback()
    const productSignals = await getProductSignals()
    const salesObjections = await getSalesObjections()
    const churnRisks = await getChurnRisks()

    expect(highImpact[0]!.impact).toMatch(/critical|high/)
    expect(recurring.every((feedback) => ['recurring', 'very_recurring'].includes(feedback.frequency))).toBe(true)
    expect(productSignals.every((feedback) => ['feature_request', 'bug', 'improvement', 'product_insight'].includes(feedback.type))).toBe(true)
    expect(salesObjections.every((feedback) => ['objection', 'sales_insight', 'pricing', 'churn_risk'].includes(feedback.type))).toBe(true)
    expect(churnRisks.every((feedback) => feedback.type === 'churn_risk')).toBe(true)
  })

  it('gets feedbacks by lead', async () => {
    const feedbacks = await getFeedbacksByLead('lead-001')

    expect(feedbacks.length).toBeGreaterThan(0)
    expect(feedbacks.every((feedback) => feedback.relatedLeadId === 'lead-001')).toBe(true)
  })

  it('calculates stats, dashboard summary and top patterns', async () => {
    const stats = await getFeedbackStats()
    const summary = await getFeedbackDashboardSummary()
    const patterns = await getTopFeedbackPatterns()

    expect(stats.total).toBeGreaterThanOrEqual(25)
    expect(stats.active).toBeGreaterThan(0)
    expect(stats.byType.feature_request).toBeGreaterThan(0)
    expect(stats.byImpact.high + stats.byImpact.critical).toBeGreaterThan(0)
    expect(summary.unresolved).toBeGreaterThan(0)
    expect(summary.productSignals).toBeGreaterThan(0)
    expect(summary.salesSignals).toBeGreaterThan(0)
    expect(patterns[0]!.count).toBeGreaterThanOrEqual(patterns[1]?.count ?? 0)
  })

  it('converts feedback to note and task payloads', async () => {
    const feedback = (await getHighImpactFeedback())[0]!
    const notePayload = convertFeedbackToNotePayload(feedback)
    const taskPayload = convertFeedbackToTaskPayload(feedback)

    expect(notePayload).toMatchObject({
      title: expect.stringContaining(feedback.title),
      relatedFeedbackId: feedback.id,
      relatedLeadId: feedback.relatedLeadId ?? undefined,
      source: 'feedback',
    })
    expect(taskPayload).toMatchObject({
      title: expect.stringContaining(feedback.title),
      relatedFeedbackId: feedback.id,
      relatedLeadId: feedback.relatedLeadId ?? undefined,
      source: 'feedback',
      status: 'pending',
    })
  })
})
