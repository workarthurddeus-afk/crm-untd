import { feedbacksRepo } from '@/lib/repositories/feedbacks.repository'
import { feedbackInputSchema, feedbackUpdateSchema } from '@/lib/schemas/feedback'
import type {
  Feedback,
  FeedbackFilters,
  FeedbackImpact,
  FeedbackInput,
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
  NoteInput,
  TaskCategory,
  TaskImportance,
  TaskInput,
} from '@/lib/types'
import {
  extractFeedbackPatterns,
  getMostCommonFeedbackTags,
  groupFeedbacksByImpact,
  groupFeedbacksByType,
  sortFeedbacksForReview,
} from '@/lib/utils/feedbacks'

const unresolvedStatuses: FeedbackStatus[] = ['new', 'reviewing', 'planned']
const productSignalTypes: FeedbackType[] = ['feature_request', 'bug', 'improvement', 'product_insight']
const salesSignalTypes: FeedbackType[] = ['objection', 'sales_insight', 'pricing', 'churn_risk']

export interface FeedbackStats {
  total: number
  active: number
  archived: number
  unresolved: number
  resolved: number
  pinned: number
  byType: Record<FeedbackType, number>
  byImpact: Record<FeedbackImpact, number>
  byPriority: Record<FeedbackPriority, number>
}

export interface FeedbackDashboardSummary {
  total: number
  unresolved: number
  highImpact: number
  recurring: number
  productSignals: number
  salesSignals: number
  churnRisks: number
  topTags: Array<{ tag: string; count: number }>
}

export async function getFeedbackInbox(filters?: FeedbackFilters): Promise<Feedback[]> {
  return feedbacksRepo.listFeedbacks(filters)
}

export async function createFeedback(input: FeedbackInput): Promise<Feedback> {
  return feedbacksRepo.createFeedback(feedbackInputSchema.parse(input))
}

export async function updateFeedback(id: string, input: Partial<FeedbackInput>): Promise<Feedback> {
  return feedbacksRepo.updateFeedback(id, feedbackUpdateSchema.parse(input))
}

export async function archiveFeedback(id: string): Promise<Feedback> {
  return feedbacksRepo.archiveFeedback(id)
}

export async function unarchiveFeedback(id: string): Promise<Feedback> {
  return feedbacksRepo.unarchiveFeedback(id)
}

export async function resolveFeedback(id: string, resolvedAt?: string): Promise<Feedback> {
  return feedbacksRepo.resolveFeedback(id, resolvedAt)
}

export async function reopenFeedback(id: string): Promise<Feedback> {
  return feedbacksRepo.reopenFeedback(id)
}

export async function pinFeedback(id: string): Promise<Feedback> {
  return feedbacksRepo.pinFeedback(id)
}

export async function unpinFeedback(id: string): Promise<Feedback> {
  return feedbacksRepo.unpinFeedback(id)
}

export async function deleteFeedbackPermanently(id: string): Promise<void> {
  await feedbacksRepo.deleteFeedback(id)
}

export async function getFeedbacksByLead(leadId: string): Promise<Feedback[]> {
  return feedbacksRepo.getFeedbacksByLeadId(leadId)
}

export async function getHighImpactFeedback(limit = 8): Promise<Feedback[]> {
  return (await feedbacksRepo.listFeedbacks()).filter((feedback) =>
    feedback.impact === 'high' || feedback.impact === 'critical'
  ).slice(0, limit)
}

export async function getRecurringFeedback(limit = 12): Promise<Feedback[]> {
  return (await feedbacksRepo.listFeedbacks()).filter((feedback) =>
    feedback.frequency === 'recurring' || feedback.frequency === 'very_recurring'
  ).slice(0, limit)
}

export async function getUnresolvedFeedback(limit?: number): Promise<Feedback[]> {
  const unresolved = (await feedbacksRepo.listFeedbacks()).filter((feedback) =>
    unresolvedStatuses.includes(feedback.status)
  )
  return typeof limit === 'number' ? unresolved.slice(0, limit) : unresolved
}

export async function getProductSignals(limit = 12): Promise<Feedback[]> {
  return (await feedbacksRepo.listFeedbacks()).filter((feedback) =>
    productSignalTypes.includes(feedback.type)
  ).slice(0, limit)
}

export async function getSalesObjections(limit = 12): Promise<Feedback[]> {
  return (await feedbacksRepo.listFeedbacks()).filter((feedback) =>
    salesSignalTypes.includes(feedback.type)
  ).slice(0, limit)
}

export async function getChurnRisks(limit = 8): Promise<Feedback[]> {
  return (await feedbacksRepo.listFeedbacks({ type: 'churn_risk' })).slice(0, limit)
}

export async function getTopFeedbackPatterns(limit = 8) {
  return extractFeedbackPatterns(await feedbacksRepo.listFeedbacks(), limit)
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
  const feedbacks = await feedbacksRepo.listAllFeedbacks()
  const active = feedbacks.filter((feedback) => !feedback.isArchived)
  const byPriority = feedbacks.reduce<Record<FeedbackPriority, number>>((acc, feedback) => {
    acc[feedback.priority] = (acc[feedback.priority] ?? 0) + 1
    return acc
  }, {} as Record<FeedbackPriority, number>)

  return {
    total: feedbacks.length,
    active: active.length,
    archived: feedbacks.filter((feedback) => feedback.isArchived).length,
    unresolved: active.filter((feedback) => unresolvedStatuses.includes(feedback.status)).length,
    resolved: active.filter((feedback) => feedback.status === 'resolved').length,
    pinned: feedbacks.filter((feedback) => feedback.isPinned).length,
    byType: groupFeedbacksByType(feedbacks),
    byImpact: groupFeedbacksByImpact(feedbacks),
    byPriority,
  }
}

export async function getFeedbackDashboardSummary(): Promise<FeedbackDashboardSummary> {
  const feedbacks = await feedbacksRepo.listFeedbacks()

  return {
    total: feedbacks.length,
    unresolved: feedbacks.filter((feedback) => unresolvedStatuses.includes(feedback.status)).length,
    highImpact: feedbacks.filter((feedback) => feedback.impact === 'high' || feedback.impact === 'critical').length,
    recurring: feedbacks.filter((feedback) =>
      feedback.frequency === 'recurring' || feedback.frequency === 'very_recurring'
    ).length,
    productSignals: feedbacks.filter((feedback) => productSignalTypes.includes(feedback.type)).length,
    salesSignals: feedbacks.filter((feedback) => salesSignalTypes.includes(feedback.type)).length,
    churnRisks: feedbacks.filter((feedback) => feedback.type === 'churn_risk').length,
    topTags: getMostCommonFeedbackTags(feedbacks, 8),
  }
}

export function convertFeedbackToNotePayload(feedback: Feedback): NoteInput {
  return {
    title: `Feedback: ${feedback.title}`,
    content: feedback.content,
    type: noteTypeFromFeedback(feedback),
    status: 'active',
    priority: notePriorityFromFeedback(feedback),
    impact: feedback.impact === 'critical' ? 'high' : feedback.impact,
    effort: 'medium',
    color: noteColorFromFeedback(feedback),
    tags: feedback.tags,
    folderId: 'folder-feedbacks',
    isPinned: feedback.isPinned,
    isFavorite: feedback.impact === 'critical' || feedback.priority === 'urgent',
    isArchived: false,
    relatedLeadId: feedback.relatedLeadId ?? undefined,
    relatedFeedbackId: feedback.id,
    source: 'feedback',
  }
}

export function convertFeedbackToTaskPayload(feedback: Feedback): TaskInput {
  return {
    title: `Resolver feedback: ${feedback.title}`,
    description: feedback.content,
    importance: taskImportanceFromFeedback(feedback),
    status: 'pending',
    category: taskCategoryFromFeedback(feedback),
    relatedLeadId: feedback.relatedLeadId ?? undefined,
    relatedNoteId: feedback.relatedNoteId ?? undefined,
    relatedFeedbackId: feedback.id,
    source: 'feedback',
    color: feedback.impact === 'critical' ? 'red' : 'purple',
    tagIds: feedback.tags,
  }
}

function noteTypeFromFeedback(feedback: Feedback): NoteInput['type'] {
  if (feedback.type === 'feature_request') return 'feature'
  if (feedback.type === 'bug') return 'bug'
  if (feedback.type === 'sales_insight' || feedback.type === 'objection' || feedback.type === 'pricing') return 'sales'
  if (feedback.type === 'product_insight' || feedback.type === 'improvement') return 'product'
  if (feedback.type === 'compliment' || feedback.type === 'complaint') return 'feedback'
  return 'insight'
}

function notePriorityFromFeedback(feedback: Feedback): NoteInput['priority'] {
  if (feedback.priority === 'urgent') return 'high'
  return feedback.priority
}

function noteColorFromFeedback(feedback: Feedback): NoteInput['color'] {
  if (feedback.type === 'bug' || feedback.type === 'complaint' || feedback.type === 'churn_risk') return 'red'
  if (feedback.type === 'compliment') return 'green'
  if (feedback.type === 'pricing' || feedback.type === 'objection') return 'yellow'
  if (productSignalTypes.includes(feedback.type)) return 'blue'
  return 'purple'
}

function taskImportanceFromFeedback(feedback: Feedback): TaskImportance {
  if (feedback.priority === 'urgent' || feedback.impact === 'critical') return 'high'
  if (feedback.priority === 'high' || feedback.impact === 'high') return 'high'
  if (feedback.priority === 'low' && feedback.impact === 'low') return 'low'
  return 'medium'
}

function taskCategoryFromFeedback(feedback: Feedback): TaskCategory {
  if (feedback.type === 'objection' || feedback.type === 'pricing' || feedback.type === 'sales_insight') return 'strategy'
  if (feedback.type === 'feature_request' || feedback.type === 'bug' || feedback.type === 'improvement') return 'product'
  if (feedback.type === 'onboarding' || feedback.type === 'support' || feedback.type === 'churn_risk') return 'ops'
  return 'other'
}

export { sortFeedbacksForReview }
