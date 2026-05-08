import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/types'
import type { EntityInput, Repository } from './base.repository'
import {
  fromSupabaseLeadRow,
  toSupabaseLeadInsert,
  toSupabaseLeadUpdate,
  type SupabaseLeadRow,
} from './supabase/leads.mapper'

interface LeadsSupabaseClient {
  auth?: {
    getUser(): PromiseLike<{
      data: { user: { id: string } | null }
      error: { message: string } | null
    }>
  }
  from(table: 'leads'): {
    select(columns?: string): {
      order(column: string, options?: { ascending?: boolean }): PromiseLike<{ data: SupabaseLeadRow[] | null; error: { message: string } | null }>
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: SupabaseLeadRow | null; error: { message: string } | null }>
      }
    }
    insert(payload: unknown): {
      select(columns?: string): {
        single(): PromiseLike<{ data: SupabaseLeadRow | null; error: { message: string } | null }>
      }
    }
    update(payload: unknown): {
      eq(column: string, value: string): {
        select(columns?: string): {
          single(): PromiseLike<{ data: SupabaseLeadRow | null; error: { message: string } | null }>
        }
      }
    }
    delete(): {
      eq(column: string, value: string): PromiseLike<{ error: { message: string } | null }>
    }
  }
}

function raise(error: { message: string } | null): void {
  if (!error) return
  if (error.message.includes('company_name')) {
    throw new Error('Empresa obrigatoria para criar lead.')
  }
  throw new Error(error.message)
}

async function getAuthenticatedUserId(client: LeadsSupabaseClient): Promise<string> {
  const { data, error } = (await client.auth?.getUser()) ?? {
    data: { user: null },
    error: null,
  }
  if (error) throw new Error(error.message)
  if (!data.user?.id) throw new Error('Sessao expirada. Faca login novamente.')
  return data.user.id
}

export type LeadsRepository = Repository<Lead> & {
  reset: () => Promise<void>
  clear: () => Promise<void>
  seedDemoData: () => Promise<void>
}

export function createLeadsSupabaseRepository(
  client: LeadsSupabaseClient = getSupabaseBrowserClient() as unknown as LeadsSupabaseClient
): LeadsRepository {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  return {
    async list(filters?: Partial<Lead>): Promise<Lead[]> {
      const { data, error } = await client
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      raise(error)

      const leads: Lead[] = ((data ?? []) as SupabaseLeadRow[]).map(fromSupabaseLeadRow)
      if (!filters) return leads

      return leads.filter((lead) =>
        Object.entries(filters).every(([key, value]) => {
          if (value === undefined) return true
          return (lead as unknown as Record<string, unknown>)[key] === value
        })
      )
    },

    async getById(id: string): Promise<Lead | null> {
      const { data, error } = await client.from('leads').select('*').eq('id', id).maybeSingle()
      raise(error)
      return data ? fromSupabaseLeadRow(data) : null
    },

    async create(data: EntityInput<Lead>): Promise<Lead> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('leads')
        .insert(toSupabaseLeadInsert(data, userId))
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error('Supabase did not return created lead')
      notify()
      return fromSupabaseLeadRow(row)
    },

    async update(id: string, data: Partial<Lead>): Promise<Lead> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('leads')
        .update(toSupabaseLeadUpdate(data, userId))
        .eq('id', id)
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error(`Lead ${id} not found`)
      notify()
      return fromSupabaseLeadRow(row)
    },

    async delete(id: string): Promise<void> {
      await getAuthenticatedUserId(client)
      const { error } = await client.from('leads').delete().eq('id', id)
      raise(error)
      notify()
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
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
  }
}
