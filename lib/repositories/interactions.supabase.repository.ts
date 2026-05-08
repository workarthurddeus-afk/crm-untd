import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { LeadInteraction, LeadInteractionInput } from '@/lib/types'
import {
  fromSupabaseInteractionRow,
  toSupabaseInteractionInsert,
  toSupabaseInteractionUpdate,
  type SupabaseInteractionRow,
} from './supabase/interactions.mapper'

interface InteractionsSupabaseClient {
  from(table: 'lead_interactions'): {
    select(columns?: string): {
      order(
        column: string,
        options?: { ascending?: boolean }
      ): PromiseLike<{ data: SupabaseInteractionRow[] | null; error: { message: string } | null }>
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: SupabaseInteractionRow | null; error: { message: string } | null }>
        order(
          column: string,
          options?: { ascending?: boolean }
        ): PromiseLike<{ data: SupabaseInteractionRow[] | null; error: { message: string } | null }>
      }
    }
    insert(payload: unknown): {
      select(columns?: string): {
        single(): PromiseLike<{ data: SupabaseInteractionRow | null; error: { message: string } | null }>
      }
    }
    update(payload: unknown): {
      eq(column: string, value: string): {
        select(columns?: string): {
          single(): PromiseLike<{ data: SupabaseInteractionRow | null; error: { message: string } | null }>
        }
      }
    }
    delete(): {
      eq(column: string, value: string): PromiseLike<{ error: { message: string } | null }>
    }
  }
}

function raise(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}

export type InteractionsRepository = {
  list(filters?: Partial<LeadInteraction>): Promise<LeadInteraction[]>
  getById(id: string): Promise<LeadInteraction | null>
  getByLeadId(leadId: string): Promise<LeadInteraction[]>
  create(data: LeadInteractionInput): Promise<LeadInteraction>
  update(id: string, data: Partial<LeadInteraction>): Promise<LeadInteraction>
  delete(id: string): Promise<void>
  reset(): Promise<void>
  clear(): Promise<void>
  seedDemoData(): Promise<void>
  subscribe(listener: () => void): () => void
}

export function createInteractionsSupabaseRepository(
  client: InteractionsSupabaseClient = getSupabaseBrowserClient() as unknown as InteractionsSupabaseClient
): InteractionsRepository {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  return {
    async list(filters?: Partial<LeadInteraction>): Promise<LeadInteraction[]> {
      const { data, error } = await client
        .from('lead_interactions')
        .select('*')
        .order('occurred_at', { ascending: false })
      raise(error)

      const interactions = (data ?? []).map(fromSupabaseInteractionRow)
      if (!filters) return interactions

      return interactions.filter((interaction) =>
        Object.entries(filters).every(([key, value]) => {
          if (value === undefined) return true
          return (interaction as unknown as Record<string, unknown>)[key] === value
        })
      )
    },

    async getById(id: string): Promise<LeadInteraction | null> {
      const { data, error } = await client
        .from('lead_interactions')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      raise(error)
      return data ? fromSupabaseInteractionRow(data) : null
    },

    async getByLeadId(leadId: string): Promise<LeadInteraction[]> {
      const { data, error } = await client
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', leadId)
        .order('occurred_at', { ascending: false })
      raise(error)
      return (data ?? []).map(fromSupabaseInteractionRow)
    },

    async create(data: LeadInteractionInput): Promise<LeadInteraction> {
      const { data: row, error } = await client
        .from('lead_interactions')
        .insert(toSupabaseInteractionInsert(data))
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error('Supabase did not return created interaction')
      notify()
      return fromSupabaseInteractionRow(row)
    },

    async update(id: string, data: Partial<LeadInteraction>): Promise<LeadInteraction> {
      const { data: row, error } = await client
        .from('lead_interactions')
        .update(toSupabaseInteractionUpdate(data))
        .eq('id', id)
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error(`Interaction ${id} not found`)
      notify()
      return fromSupabaseInteractionRow(row)
    },

    async delete(id: string): Promise<void> {
      const { error } = await client.from('lead_interactions').delete().eq('id', id)
      raise(error)
      notify()
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
