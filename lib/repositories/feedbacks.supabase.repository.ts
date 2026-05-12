import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Feedback, FeedbackFilters, FeedbackInput, FeedbackSort } from '@/lib/types/feedback'
import {
  filterFeedbacks as applyFeedbackFilters,
  sortFeedbacksForReview,
} from '@/lib/utils/feedbacks'
import {
  fromSupabaseFeedbackRow,
  toSupabaseFeedbackInsert,
  toSupabaseFeedbackUpdate,
  type SupabaseFeedbackRow,
} from './supabase/feedbacks.mapper'

type SupabaseError = { message: string } | null

interface FeedbacksSupabaseClient {
  auth?: {
    getUser(): PromiseLike<{
      data: { user: { id: string } | null }
      error: SupabaseError
    }>
  }
  from(table: 'feedbacks'): {
    select(columns?: string): {
      order(
        column: string,
        options?: { ascending?: boolean }
      ): PromiseLike<{ data: SupabaseFeedbackRow[] | null; error: SupabaseError }>
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: SupabaseFeedbackRow | null; error: SupabaseError }>
      }
    }
    insert(payload: unknown): {
      select(columns?: string): {
        single(): PromiseLike<{ data: SupabaseFeedbackRow | null; error: SupabaseError }>
      }
    }
    update(payload: unknown): {
      eq(column: string, value: string): {
        select(columns?: string): {
          single(): PromiseLike<{ data: SupabaseFeedbackRow | null; error: SupabaseError }>
        }
      }
    }
    delete(): {
      eq(column: string, value: string): PromiseLike<{ error: SupabaseError }>
    }
  }
}

export type CreateFeedbackInput = Partial<FeedbackInput> &
  Pick<
    FeedbackInput,
    'title' | 'content' | 'type' | 'source' | 'status' | 'impact' | 'frequency' | 'sentiment' | 'priority' | 'capturedAt'
  >

export type FeedbacksRepository = {
  list(filters?: Partial<Feedback>): Promise<Feedback[]>
  listFeedbacks(filters?: FeedbackFilters, sort?: FeedbackSort): Promise<Feedback[]>
  listAllFeedbacks(sort?: FeedbackSort): Promise<Feedback[]>
  getById(id: string): Promise<Feedback | null>
  getFeedbackById(id: string): Promise<Feedback | null>
  create(data: CreateFeedbackInput): Promise<Feedback>
  createFeedback(data: CreateFeedbackInput): Promise<Feedback>
  update(id: string, data: Partial<Feedback>): Promise<Feedback>
  updateFeedback(id: string, data: Partial<Feedback>): Promise<Feedback>
  delete(id: string): Promise<void>
  deleteFeedback(id: string): Promise<void>
  softDeleteFeedback(id: string): Promise<Feedback>
  archiveFeedback(id: string): Promise<Feedback>
  unarchiveFeedback(id: string): Promise<Feedback>
  pinFeedback(id: string): Promise<Feedback>
  unpinFeedback(id: string): Promise<Feedback>
  resolveFeedback(id: string, resolvedAt?: string): Promise<Feedback>
  reopenFeedback(id: string): Promise<Feedback>
  getFeedbacksByLeadId(leadId: string): Promise<Feedback[]>
  getFeedbacksByNoteId(noteId: string): Promise<Feedback[]>
  getFeedbacksByTaskId(taskId: string): Promise<Feedback[]>
  searchFeedbacks(query: string): Promise<Feedback[]>
  filterFeedbacks(filters: FeedbackFilters): Promise<Feedback[]>
  reset(): Promise<void>
  clear(): Promise<void>
  seedDemoData(): Promise<void>
  subscribe(listener: () => void): () => void
}

function raise(error: SupabaseError): void {
  if (error) throw new Error(error.message)
}

async function getAuthenticatedUserId(client: FeedbacksSupabaseClient): Promise<string> {
  const { data, error } = (await client.auth?.getUser()) ?? {
    data: { user: null },
    error: null,
  }
  if (error) throw new Error(error.message)
  if (!data.user?.id) throw new Error('Sessao expirada. Faca login novamente.')
  return data.user.id
}

export function createFeedbacksSupabaseRepository(
  client: FeedbacksSupabaseClient = getSupabaseBrowserClient() as unknown as FeedbacksSupabaseClient
): FeedbacksRepository {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  async function allFeedbacks(): Promise<Feedback[]> {
    const { data, error } = await client.from('feedbacks').select('*').order('captured_at', { ascending: false })
    raise(error)
    return (data ?? []).map(fromSupabaseFeedbackRow)
  }

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
      const { data, error } = await client.from('feedbacks').select('*').eq('id', id).maybeSingle()
      raise(error)
      return data ? fromSupabaseFeedbackRow(data) : null
    },
    async create(data: CreateFeedbackInput): Promise<Feedback> {
      return this.createFeedback(data)
    },
    async createFeedback(data: CreateFeedbackInput): Promise<Feedback> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('feedbacks')
        .insert(toSupabaseFeedbackInsert(data, userId))
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error('Supabase did not return created feedback')
      notify()
      return fromSupabaseFeedbackRow(row)
    },
    async update(id: string, data: Partial<Feedback>): Promise<Feedback> {
      return this.updateFeedback(id, data)
    },
    async updateFeedback(id: string, data: Partial<Feedback>): Promise<Feedback> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('feedbacks')
        .update(toSupabaseFeedbackUpdate(data, userId))
        .eq('id', id)
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error(`Feedback ${id} not found`)
      notify()
      return fromSupabaseFeedbackRow(row)
    },
    async delete(id: string): Promise<void> {
      return this.deleteFeedback(id)
    },
    async deleteFeedback(id: string): Promise<void> {
      await getAuthenticatedUserId(client)
      const { error } = await client.from('feedbacks').delete().eq('id', id)
      raise(error)
      notify()
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
      notify()
    },
    async clear(): Promise<void> {
      notify()
    },
    async seedDemoData(): Promise<void> {
      notify()
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
