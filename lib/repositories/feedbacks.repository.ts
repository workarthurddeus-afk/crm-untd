import { feedbacksSeed } from '@/lib/mocks/seeds/feedbacks.seed'
import type { Feedback, FeedbackFilters, FeedbackInput, FeedbackSort } from '@/lib/types'
import {
  filterFeedbacks as applyFeedbackFilters,
  normalizeFeedback,
  normalizeFeedbackTag,
  sortFeedbacksForReview,
} from '@/lib/utils/feedbacks'
import { createMockRepository } from './mock-storage'

type CreateFeedbackInput = Partial<FeedbackInput> &
  Pick<
    FeedbackInput,
    'title' | 'content' | 'type' | 'source' | 'status' | 'impact' | 'frequency' | 'sentiment' | 'priority' | 'capturedAt'
  >

const storageRepo = createMockRepository<Feedback>(
  'untd-feedbacks',
  feedbacksSeed.map(normalizeFeedback)
)

async function allFeedbacks(): Promise<Feedback[]> {
  return (await storageRepo.list()).map(normalizeFeedback)
}

function completeForCreate(input: CreateFeedbackInput): Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'> {
  const status = input.isArchived ? 'archived' : input.status
  return {
    title: input.title.trim(),
    content: input.content.trim(),
    type: input.type,
    source: input.source,
    status,
    impact: input.impact,
    frequency: input.frequency,
    sentiment: input.sentiment,
    priority: input.priority,
    tags: [...new Set((input.tags ?? []).map(normalizeFeedbackTag).filter(Boolean))],
    relatedLeadId: input.relatedLeadId ?? null,
    relatedNoteId: input.relatedNoteId ?? null,
    relatedTaskId: input.relatedTaskId ?? null,
    relatedCalendarEventId: input.relatedCalendarEventId ?? null,
    relatedProjectId: input.relatedProjectId ?? null,
    isArchived: input.isArchived ?? status === 'archived',
    isPinned: input.isPinned ?? false,
    capturedAt: input.capturedAt,
    resolvedAt: status === 'resolved' ? input.capturedAt : null,
  }
}

function completeForUpdate(current: Feedback, patch: Partial<Feedback>): Partial<Feedback> {
  const next = normalizeFeedback({ ...current, ...patch })
  const status = patch.isArchived ? 'archived' : patch.status ?? next.status
  return withoutUndefined({
    ...patch,
    title: patch.title?.trim(),
    content: patch.content?.trim(),
    tags: patch.tags ? [...new Set(patch.tags.map(normalizeFeedbackTag).filter(Boolean))] : next.tags,
    isArchived: patch.isArchived ?? status === 'archived',
    status,
    resolvedAt:
      status === 'resolved'
        ? patch.resolvedAt ?? next.resolvedAt ?? new Date().toISOString()
        : status === 'archived'
          ? next.resolvedAt
          : patch.resolvedAt === undefined
            ? next.resolvedAt
            : patch.resolvedAt,
  })
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>
}

export const feedbacksRepo = {
  async list(filters?: Partial<Feedback>): Promise<Feedback[]> {
    return this.listFeedbacks(filters as FeedbackFilters)
  },
  async listFeedbacks(filters?: FeedbackFilters, sort: FeedbackSort = 'review'): Promise<Feedback[]> {
    return sortFeedbacksForReview(applyFeedbackFilters(await allFeedbacks(), filters), sort)
  },
  async listAllFeedbacks(sort: FeedbackSort = 'review'): Promise<Feedback[]> {
    return sortFeedbacksForReview(await allFeedbacks(), sort)
  },
  async getById(id: string): Promise<Feedback | null> {
    return this.getFeedbackById(id)
  },
  async getFeedbackById(id: string): Promise<Feedback | null> {
    const feedback = await storageRepo.getById(id)
    return feedback ? normalizeFeedback(feedback) : null
  },
  async create(data: CreateFeedbackInput): Promise<Feedback> {
    return this.createFeedback(data)
  },
  async createFeedback(data: CreateFeedbackInput): Promise<Feedback> {
    return normalizeFeedback(await storageRepo.create(completeForCreate(data)))
  },
  async update(id: string, data: Partial<Feedback>): Promise<Feedback> {
    return this.updateFeedback(id, data)
  },
  async updateFeedback(id: string, data: Partial<Feedback>): Promise<Feedback> {
    const current = await storageRepo.getById(id)
    if (!current) throw new Error(`Feedback ${id} not found`)
    return normalizeFeedback(await storageRepo.update(id, completeForUpdate(current, data)))
  },
  async deleteFeedback(id: string): Promise<void> {
    await storageRepo.delete(id)
  },
  async softDeleteFeedback(id: string): Promise<Feedback> {
    return this.archiveFeedback(id)
  },
  async archiveFeedback(id: string): Promise<Feedback> {
    return this.updateFeedback(id, { isArchived: true, status: 'archived' })
  },
  async unarchiveFeedback(id: string): Promise<Feedback> {
    const current = await this.getFeedbackById(id)
    const status = current?.status === 'archived' ? 'new' : current?.status ?? 'new'
    return this.updateFeedback(id, { isArchived: false, status })
  },
  async pinFeedback(id: string): Promise<Feedback> {
    return this.updateFeedback(id, { isPinned: true })
  },
  async unpinFeedback(id: string): Promise<Feedback> {
    return this.updateFeedback(id, { isPinned: false })
  },
  async resolveFeedback(id: string, resolvedAt = new Date().toISOString()): Promise<Feedback> {
    return this.updateFeedback(id, { status: 'resolved', resolvedAt, isArchived: false })
  },
  async reopenFeedback(id: string): Promise<Feedback> {
    return this.updateFeedback(id, { status: 'reviewing', resolvedAt: null, isArchived: false })
  },
  async getFeedbacksByLeadId(leadId: string): Promise<Feedback[]> {
    return this.filterFeedbacks({ relatedLeadId: leadId })
  },
  async getFeedbacksByNoteId(noteId: string): Promise<Feedback[]> {
    return this.filterFeedbacks({ relatedNoteId: noteId })
  },
  async getFeedbacksByTaskId(taskId: string): Promise<Feedback[]> {
    return this.filterFeedbacks({ relatedTaskId: taskId })
  },
  async searchFeedbacks(query: string): Promise<Feedback[]> {
    return this.filterFeedbacks({ query })
  },
  async filterFeedbacks(filters: FeedbackFilters): Promise<Feedback[]> {
    return this.listFeedbacks(filters)
  },
  async reset(): Promise<void> {
    await storageRepo.reset()
  },
  async clear(): Promise<void> {
    await storageRepo.clear()
  },
  async seedDemoData(): Promise<void> {
    await storageRepo.seedDemoData()
  },
  subscribe(listener: () => void): () => void {
    return storageRepo.subscribe(listener)
  },
}
