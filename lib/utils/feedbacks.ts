import type {
  Feedback,
  FeedbackFilters,
  FeedbackFrequency,
  FeedbackImpact,
  FeedbackPriority,
  FeedbackSort,
  FeedbackType,
} from '@/lib/types'

const impactWeight: Record<FeedbackImpact, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const priorityWeight: Record<FeedbackPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const frequencyWeight: Record<FeedbackFrequency, number> = {
  very_recurring: 3,
  recurring: 2,
  one_off: 1,
}

export function normalizeFeedbackTag(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeFeedback(feedback: Feedback): Feedback {
  const tags = [...new Set(feedback.tags.map(normalizeFeedbackTag).filter(Boolean))]
  const isArchived = feedback.isArchived || feedback.status === 'archived'
  const status = isArchived ? 'archived' : feedback.status

  return {
    ...feedback,
    title: feedback.title.trim(),
    content: feedback.content.trim(),
    tags,
    isArchived,
    status,
    resolvedAt: feedback.resolvedAt ?? null,
    relatedLeadId: feedback.relatedLeadId ?? null,
    relatedNoteId: feedback.relatedNoteId ?? null,
    relatedTaskId: feedback.relatedTaskId ?? null,
    relatedCalendarEventId: feedback.relatedCalendarEventId ?? null,
    relatedProjectId: feedback.relatedProjectId ?? null,
  }
}

export function calculateFeedbackPriorityScore(feedback: Feedback): number {
  if (feedback.isArchived || feedback.status === 'archived') return Number.NEGATIVE_INFINITY
  let score = 0
  score += impactWeight[feedback.impact] * 20
  score += priorityWeight[feedback.priority] * 12
  score += frequencyWeight[feedback.frequency] * 10
  if (feedback.isPinned) score += 25
  if (feedback.type === 'churn_risk') score += 18
  if (feedback.type === 'objection' || feedback.type === 'feature_request') score += 10
  if (feedback.sentiment === 'negative') score += 8
  return score
}

export function sortFeedbacksForReview(
  feedbacks: Feedback[],
  sort: FeedbackSort = 'review'
): Feedback[] {
  return [...feedbacks].sort((a, b) => {
    if (sort === 'title-asc') return a.title.localeCompare(b.title)
    if (sort === 'captured-desc') return b.capturedAt.localeCompare(a.capturedAt)
    if (sort === 'impact-desc') return impactWeight[b.impact] - impactWeight[a.impact]
    if (sort === 'priority-desc') return priorityWeight[b.priority] - priorityWeight[a.priority]

    const pinnedDelta = Number(b.isPinned) - Number(a.isPinned)
    if (pinnedDelta !== 0) return pinnedDelta
    const scoreDelta = calculateFeedbackPriorityScore(b) - calculateFeedbackPriorityScore(a)
    if (scoreDelta !== 0) return scoreDelta
    return b.capturedAt.localeCompare(a.capturedAt)
  })
}

export function filterFeedbacks(feedbacks: Feedback[], filters: FeedbackFilters = {}): Feedback[] {
  const query = filters.query?.trim().toLowerCase()
  const tags = filters.tags?.map(normalizeFeedbackTag).filter(Boolean)

  return feedbacks.map(normalizeFeedback).filter((feedback) => {
    if (filters.isArchived === undefined && feedback.isArchived) return false
    if (filters.isArchived !== undefined && feedback.isArchived !== filters.isArchived) return false
    if (query) {
      const haystack = [feedback.title, feedback.content, ...feedback.tags].join(' ').toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (tags?.length && !tags.every((tag) => feedback.tags.includes(tag))) return false
    if (filters.type && feedback.type !== filters.type) return false
    if (filters.source && feedback.source !== filters.source) return false
    if (filters.status && feedback.status !== filters.status) return false
    if (filters.impact && feedback.impact !== filters.impact) return false
    if (filters.frequency && feedback.frequency !== filters.frequency) return false
    if (filters.sentiment && feedback.sentiment !== filters.sentiment) return false
    if (filters.priority && feedback.priority !== filters.priority) return false
    if (filters.relatedLeadId !== undefined && feedback.relatedLeadId !== filters.relatedLeadId) return false
    if (filters.relatedNoteId !== undefined && feedback.relatedNoteId !== filters.relatedNoteId) return false
    if (filters.relatedTaskId !== undefined && feedback.relatedTaskId !== filters.relatedTaskId) return false
    if (
      filters.relatedCalendarEventId !== undefined &&
      feedback.relatedCalendarEventId !== filters.relatedCalendarEventId
    ) {
      return false
    }
    if (filters.isPinned !== undefined && feedback.isPinned !== filters.isPinned) return false
    if (filters.capturedFrom && feedback.capturedAt < filters.capturedFrom) return false
    if (filters.capturedTo && feedback.capturedAt > filters.capturedTo) return false
    return true
  })
}

export function groupFeedbacksByType(feedbacks: Feedback[]): Record<FeedbackType, number> {
  return feedbacks.reduce<Record<FeedbackType, number>>((acc, feedback) => {
    acc[feedback.type] = (acc[feedback.type] ?? 0) + 1
    return acc
  }, {} as Record<FeedbackType, number>)
}

export function groupFeedbacksByImpact(feedbacks: Feedback[]): Record<FeedbackImpact, number> {
  return feedbacks.reduce<Record<FeedbackImpact, number>>((acc, feedback) => {
    acc[feedback.impact] = (acc[feedback.impact] ?? 0) + 1
    return acc
  }, {} as Record<FeedbackImpact, number>)
}

export function getMostCommonFeedbackTags(
  feedbacks: Feedback[],
  limit = 20
): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>()
  for (const feedback of feedbacks.map(normalizeFeedback)) {
    for (const tag of feedback.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit)
}

export function extractFeedbackPatterns(
  feedbacks: Feedback[],
  limit = 8
): Array<{ key: string; label: string; count: number; score: number; feedbackIds: string[] }> {
  const groups = new Map<string, { count: number; score: number; ids: string[] }>()

  for (const feedback of feedbacks.map(normalizeFeedback)) {
    for (const key of [feedback.type, ...feedback.tags]) {
      const current = groups.get(key) ?? { count: 0, score: 0, ids: [] }
      current.count += 1
      current.score += calculateFeedbackPriorityScore(feedback)
      current.ids.push(feedback.id)
      groups.set(key, current)
    }
  }

  return [...groups.entries()]
    .map(([key, value]) => ({
      key,
      label: key.replace(/-/g, ' '),
      count: value.count,
      score: value.score,
      feedbackIds: value.ids,
    }))
    .sort((a, b) => b.count - a.count || b.score - a.score || a.key.localeCompare(b.key))
    .slice(0, limit)
}
