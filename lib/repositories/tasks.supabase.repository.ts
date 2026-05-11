import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Repository } from '@/lib/repositories/base.repository'
import type { Task, TaskInput } from '@/lib/types/task'
import {
  fromSupabaseTaskRow,
  toSupabaseTaskInsert,
  toSupabaseTaskUpdate,
  type SupabaseTaskRow,
} from './supabase/tasks.mapper'

type SupabaseError = { message: string } | null

interface TasksSupabaseClient {
  auth?: {
    getUser(): PromiseLike<{
      data: { user: { id: string } | null }
      error: SupabaseError
    }>
  }
  from(table: 'tasks'): {
    select(columns?: string): {
      order(
        column: string,
        options?: { ascending?: boolean; nullsFirst?: boolean }
      ): PromiseLike<{ data: SupabaseTaskRow[] | null; error: SupabaseError }>
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: SupabaseTaskRow | null; error: SupabaseError }>
      }
    }
    insert(payload: unknown): {
      select(columns?: string): {
        single(): PromiseLike<{ data: SupabaseTaskRow | null; error: SupabaseError }>
      }
    }
    update(payload: unknown): {
      eq(column: string, value: string): {
        select(columns?: string): {
          single(): PromiseLike<{ data: SupabaseTaskRow | null; error: SupabaseError }>
        }
      }
    }
    delete(): {
      eq(column: string, value: string): PromiseLike<{ error: SupabaseError }>
    }
  }
}

export type TasksRepository = Repository<Task, TaskInput> & {
  reset(): Promise<void>
  clear(): Promise<void>
  seedDemoData(): Promise<void>
}

function raise(error: SupabaseError): void {
  if (error) throw new Error(error.message)
}

async function getAuthenticatedUserId(client: TasksSupabaseClient): Promise<string> {
  const { data, error } = (await client.auth?.getUser()) ?? {
    data: { user: null },
    error: null,
  }
  if (error) throw new Error(error.message)
  if (!data.user?.id) throw new Error('Sessao expirada. Faca login novamente.')
  return data.user.id
}

function matchesFilters(task: Task, filters?: Partial<Task>): boolean {
  if (!filters) return true
  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined) return true
    return task[key as keyof Task] === value
  })
}

export function createTasksSupabaseRepository(
  client: TasksSupabaseClient = getSupabaseBrowserClient() as unknown as TasksSupabaseClient
): TasksRepository {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  return {
    async list(filters?: Partial<Task>): Promise<Task[]> {
      const { data, error } = await client.from('tasks').select('*').order('created_at', { ascending: false })
      raise(error)
      return (data ?? []).map(fromSupabaseTaskRow).filter((task) => matchesFilters(task, filters))
    },

    async getById(id: string): Promise<Task | null> {
      const { data, error } = await client.from('tasks').select('*').eq('id', id).maybeSingle()
      raise(error)
      return data ? fromSupabaseTaskRow(data) : null
    },

    async create(data: TaskInput): Promise<Task> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('tasks')
        .insert(toSupabaseTaskInsert(data, userId))
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error('Supabase did not return created task')
      notify()
      return fromSupabaseTaskRow(row)
    },

    async update(id: string, data: Partial<Task>): Promise<Task> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('tasks')
        .update(toSupabaseTaskUpdate(data, userId))
        .eq('id', id)
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error(`Task ${id} not found`)
      notify()
      return fromSupabaseTaskRow(row)
    },

    async delete(id: string): Promise<void> {
      await getAuthenticatedUserId(client)
      const { error } = await client.from('tasks').delete().eq('id', id)
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
