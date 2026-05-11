import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { NoteFolder, NoteFolderInput } from '@/lib/types'
import {
  fromSupabaseNoteFolderRow,
  toSupabaseNoteFolderInsert,
  toSupabaseNoteFolderUpdate,
  type SupabaseNoteFolderRow,
} from './supabase/note-folders.mapper'

type SupabaseError = { message: string } | null

interface NoteFoldersSupabaseClient {
  auth?: {
    getUser(): PromiseLike<{
      data: { user: { id: string } | null }
      error: SupabaseError
    }>
  }
  from(table: 'note_folders'): {
    select(columns?: string): {
      order(
        column: string,
        options?: { ascending?: boolean }
      ): PromiseLike<{ data: SupabaseNoteFolderRow[] | null; error: SupabaseError }>
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: SupabaseNoteFolderRow | null; error: SupabaseError }>
      }
    }
    insert(payload: unknown): {
      select(columns?: string): {
        single(): PromiseLike<{ data: SupabaseNoteFolderRow | null; error: SupabaseError }>
      }
    }
    update(payload: unknown): {
      eq(column: string, value: string): {
        select(columns?: string): {
          single(): PromiseLike<{ data: SupabaseNoteFolderRow | null; error: SupabaseError }>
        }
      }
    }
    delete(): {
      eq(column: string, value: string): PromiseLike<{ error: SupabaseError }>
    }
  }
}

function raise(error: SupabaseError): void {
  if (error) throw new Error(error.message)
}

async function getAuthenticatedUserId(client: NoteFoldersSupabaseClient): Promise<string> {
  const { data, error } = (await client.auth?.getUser()) ?? {
    data: { user: null },
    error: null,
  }
  if (error) throw new Error(error.message)
  if (!data.user?.id) throw new Error('Sessao expirada. Faca login novamente.')
  return data.user.id
}

export type NoteFoldersRepository = {
  listFolders(filters?: Partial<NoteFolder>): Promise<NoteFolder[]>
  listAllFolders(): Promise<NoteFolder[]>
  getFolderById(id: string): Promise<NoteFolder | null>
  createFolder(data: NoteFolderInput): Promise<NoteFolder>
  updateFolder(id: string, data: Partial<NoteFolder>): Promise<NoteFolder>
  archiveFolder(id: string): Promise<NoteFolder>
  restoreFolder(id: string): Promise<NoteFolder>
  deleteFolder(id: string): Promise<void>
  reset(): Promise<void>
  clear(): Promise<void>
  seedDemoData(): Promise<void>
  subscribe(listener: () => void): () => void
}

function sortFolders(folders: NoteFolder[]): NoteFolder[] {
  return [...folders].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
}

export function createNoteFoldersSupabaseRepository(
  client: NoteFoldersSupabaseClient = getSupabaseBrowserClient() as unknown as NoteFoldersSupabaseClient
): NoteFoldersRepository {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  return {
    async listFolders(filters?: Partial<NoteFolder>): Promise<NoteFolder[]> {
      const folders = await this.listAllFolders()
      return folders
        .filter((folder) => {
          if (filters?.isArchived !== undefined) return folder.isArchived === filters.isArchived
          return !folder.isArchived
        })
        .filter((folder) => {
          if (!filters) return true
          return Object.entries(filters).every(([key, value]) => {
            if (value === undefined || key === 'isArchived') return true
            return (folder as unknown as Record<string, unknown>)[key] === value
          })
        })
    },

    async listAllFolders(): Promise<NoteFolder[]> {
      const { data, error } = await client
        .from('note_folders')
        .select('*')
        .order('order_index', { ascending: true })
      raise(error)
      return sortFolders((data ?? []).map(fromSupabaseNoteFolderRow))
    },

    async getFolderById(id: string): Promise<NoteFolder | null> {
      const { data, error } = await client.from('note_folders').select('*').eq('id', id).maybeSingle()
      raise(error)
      return data ? fromSupabaseNoteFolderRow(data) : null
    },

    async createFolder(data: NoteFolderInput): Promise<NoteFolder> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('note_folders')
        .insert(toSupabaseNoteFolderInsert(data, userId))
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error('Supabase did not return created note folder')
      notify()
      return fromSupabaseNoteFolderRow(row)
    },

    async updateFolder(id: string, data: Partial<NoteFolder>): Promise<NoteFolder> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('note_folders')
        .update(toSupabaseNoteFolderUpdate(data, userId))
        .eq('id', id)
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error(`Note folder ${id} not found`)
      notify()
      return fromSupabaseNoteFolderRow(row)
    },

    async archiveFolder(id: string): Promise<NoteFolder> {
      return this.updateFolder(id, { isArchived: true })
    },

    async restoreFolder(id: string): Promise<NoteFolder> {
      return this.updateFolder(id, { isArchived: false })
    },

    async deleteFolder(id: string): Promise<void> {
      await getAuthenticatedUserId(client)
      const { error } = await client.from('note_folders').delete().eq('id', id)
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
