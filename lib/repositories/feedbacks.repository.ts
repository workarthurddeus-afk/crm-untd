import { feedbacksSeed } from '@/lib/mocks/seeds/feedbacks.seed'
import type { Feedback, FeedbackFilters, FeedbackInput, FeedbackSort } from '@/lib/types'
import {
  filterFeedbacks as applyFeedbackFilters,
  normalizeFeedback,
  normalizeFeedbackTag,
  sortFeedbacksForReview,
} from '@/lib/utils/feedbacks'
import { createMockRepository } from './mock-storage'
import {
  createFeedbacksSupabaseRepository,
  type CreateFeedbackInput,
  type FeedbacksRepository,
} from './feedbacks.supabase.repository'

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

function createLocalFeedbacksRepository(): FeedbacksRepository {
  return {
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
  async delete(id: string): Promise<void> {
    return this.deleteFeedback(id)
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
}

export type FeedbacksDataSource = 'local' | 'supabase'

export function resolveFeedbacksDataSource(value: string | undefined): FeedbacksDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

export function createFeedbacksRepository(
  dataSource: FeedbacksDataSource = resolveFeedbacksDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
): FeedbacksRepository {
  if (dataSource === 'supabase') return createFeedbacksSupabaseRepository()
  return localFeedbacksRepo
}

const localFeedbacksRepo = createLocalFeedbacksRepository()
let supabaseFeedbacksRepo: FeedbacksRepository | null = null

function getActiveFeedbacksRepository(): FeedbacksRepository {
  if (resolveFeedbacksDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE) !== 'supabase') {
    return localFeedbacksRepo
  }

  supabaseFeedbacksRepo ??= createFeedbacksSupabaseRepository()
  return supabaseFeedbacksRepo
}

export const feedbacksRepo = new Proxy({} as FeedbacksRepository, {
  get(_target, property: keyof FeedbacksRepository) {
    if (property === 'subscribe') {
      return (listener: () => void) => getActiveFeedbacksRepository().subscribe(listener)
    }

    return async (...args: unknown[]) => {
      const repository = getActiveFeedbacksRepository()
      const value = repository[property]
      if (typeof value !== 'function') return value
      return (value as (...items: unknown[]) => unknown).apply(repository, args)
    }
  },
})
