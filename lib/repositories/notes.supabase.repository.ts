import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Note, NoteInput } from '@/lib/types'
import { filterNotes as applyNoteFilters, sortNotes, type NoteFilters, type NoteSort } from '@/lib/utils/notes'
import {
  fromSupabaseNoteRow,
  toSupabaseNoteInsert,
  toSupabaseNoteUpdate,
  type SupabaseNoteRow,
} from './supabase/notes.mapper'

type SupabaseError = { message: string } | null

interface NotesSupabaseClient {
  auth?: {
    getUser(): PromiseLike<{
      data: { user: { id: string } | null }
      error: SupabaseError
    }>
  }
  from(table: 'notes'): {
    select(columns?: string): {
      order(
        column: string,
        options?: { ascending?: boolean }
      ): PromiseLike<{ data: SupabaseNoteRow[] | null; error: SupabaseError }>
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: SupabaseNoteRow | null; error: SupabaseError }>
        order(
          column: string,
          options?: { ascending?: boolean }
        ): PromiseLike<{ data: SupabaseNoteRow[] | null; error: SupabaseError }>
      }
    }
    insert(payload: unknown): {
      select(columns?: string): {
        single(): PromiseLike<{ data: SupabaseNoteRow | null; error: SupabaseError }>
      }
    }
    update(payload: unknown): {
      eq(column: string, value: string): {
        select(columns?: string): {
          single(): PromiseLike<{ data: SupabaseNoteRow | null; error: SupabaseError }>
        }
      }
    }
    delete(): {
      eq(column: string, value: string): PromiseLike<{ error: SupabaseError }>
    }
  }
}

export type CreateNoteInput = Partial<NoteInput> &
  Pick<Partial<Note>, 'excerpt'> &
  Pick<NoteInput, 'title' | 'content' | 'type' | 'status' | 'priority' | 'impact' | 'effort' | 'color'>

export type NotesRepository = {
  list(filters?: Partial<Note>): Promise<Note[]>
  listNotes(filters?: NoteFilters, sort?: NoteSort): Promise<Note[]>
  listAllNotes(includeDeleted?: boolean, sort?: NoteSort): Promise<Note[]>
  getById(id: string): Promise<Note | null>
  getNoteById(id: string): Promise<Note | null>
  create(data: CreateNoteInput): Promise<Note>
  createNote(data: CreateNoteInput): Promise<Note>
  update(id: string, data: Partial<Note>): Promise<Note>
  updateNote(id: string, data: Partial<Note>): Promise<Note>
  delete(id: string): Promise<void>
  deleteNote(id: string): Promise<Note>
  softDeleteNote(id: string): Promise<Note>
  archiveNote(id: string): Promise<Note>
  unarchiveNote(id: string): Promise<Note>
  pinNote(id: string): Promise<Note>
  unpinNote(id: string): Promise<Note>
  favoriteNote(id: string): Promise<Note>
  unfavoriteNote(id: string): Promise<Note>
  moveNoteToFolder(noteId: string, folderId: string | null): Promise<Note>
  getNotesByFolder(folderId: string | null): Promise<Note[]>
  getNotesByTag(tag: string): Promise<Note[]>
  getNotesByLeadId(leadId: string): Promise<Note[]>
  getNotesByTaskId(taskId: string): Promise<Note[]>
  searchNotes(query: string): Promise<Note[]>
  filterNotes(filters: NoteFilters): Promise<Note[]>
  getPinnedNotes(): Promise<Note[]>
  getFavoriteNotes(): Promise<Note[]>
  getRecentNotes(limit?: number): Promise<Note[]>
  getHighImpactNotes(): Promise<Note[]>
  reset(): Promise<void>
  clear(): Promise<void>
  seedDemoData(): Promise<void>
  subscribe(listener: () => void): () => void
}

function raise(error: SupabaseError): void {
  if (error) throw new Error(error.message)
}

async function getAuthenticatedUserId(client: NotesSupabaseClient): Promise<string> {
  const { data, error } = (await client.auth?.getUser()) ?? {
    data: { user: null },
    error: null,
  }
  if (error) throw new Error(error.message)
  if (!data.user?.id) throw new Error('Sessao expirada. Faca login novamente.')
  return data.user.id
}

export function createNotesSupabaseRepository(
  client: NotesSupabaseClient = getSupabaseBrowserClient() as unknown as NotesSupabaseClient
): NotesRepository {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  async function allNotes(): Promise<Note[]> {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    raise(error)
    return (data ?? []).map(fromSupabaseNoteRow)
  }

  return {
    async list(filters?: Partial<Note>): Promise<Note[]> {
      return this.listNotes(filters as NoteFilters)
    },

    async listNotes(filters?: NoteFilters, sort: NoteSort = 'strategic'): Promise<Note[]> {
      return sortNotes(applyNoteFilters(await allNotes(), filters), sort)
    },

    async listAllNotes(includeDeleted = false, sort: NoteSort = 'strategic'): Promise<Note[]> {
      const notes = (await allNotes()).filter((note) => includeDeleted || !note.isDeleted)
      return sortNotes(notes, sort)
    },

    async getById(id: string): Promise<Note | null> {
      return this.getNoteById(id)
    },

    async getNoteById(id: string): Promise<Note | null> {
      const { data, error } = await client.from('notes').select('*').eq('id', id).maybeSingle()
      raise(error)
      return data ? fromSupabaseNoteRow(data) : null
    },

    async create(data: CreateNoteInput): Promise<Note> {
      return this.createNote(data)
    },

    async createNote(data: CreateNoteInput): Promise<Note> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('notes')
        .insert(toSupabaseNoteInsert(data, userId))
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error('Supabase did not return created note')
      notify()
      return fromSupabaseNoteRow(row)
    },

    async update(id: string, data: Partial<Note>): Promise<Note> {
      return this.updateNote(id, data)
    },

    async updateNote(id: string, data: Partial<Note>): Promise<Note> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('notes')
        .update(toSupabaseNoteUpdate(data, userId))
        .eq('id', id)
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error(`Note ${id} not found`)
      notify()
      return fromSupabaseNoteRow(row)
    },

    async delete(id: string): Promise<void> {
      await getAuthenticatedUserId(client)
      const { error } = await client.from('notes').delete().eq('id', id)
      raise(error)
      notify()
    },

    async deleteNote(id: string): Promise<Note> {
      return this.updateNote(id, { isDeleted: true })
    },

    async softDeleteNote(id: string): Promise<Note> {
      return this.deleteNote(id)
    },

    async archiveNote(id: string): Promise<Note> {
      return this.updateNote(id, { isArchived: true, status: 'archived' })
    },

    async unarchiveNote(id: string): Promise<Note> {
      return this.updateNote(id, { isArchived: false, status: 'active' })
    },

    async pinNote(id: string): Promise<Note> {
      return this.updateNote(id, { isPinned: true })
    },

    async unpinNote(id: string): Promise<Note> {
      return this.updateNote(id, { isPinned: false })
    },

    async favoriteNote(id: string): Promise<Note> {
      return this.updateNote(id, { isFavorite: true })
    },

    async unfavoriteNote(id: string): Promise<Note> {
      return this.updateNote(id, { isFavorite: false })
    },

    async moveNoteToFolder(noteId: string, folderId: string | null): Promise<Note> {
      return this.updateNote(noteId, { folderId })
    },

    async getNotesByFolder(folderId: string | null): Promise<Note[]> {
      return this.filterNotes({ folderId })
    },

    async getNotesByTag(tag: string): Promise<Note[]> {
      return this.filterNotes({ tags: [tag] })
    },

    async getNotesByLeadId(leadId: string): Promise<Note[]> {
      return this.filterNotes({ relatedLeadId: leadId })
    },

    async getNotesByTaskId(taskId: string): Promise<Note[]> {
      return this.filterNotes({ relatedTaskId: taskId })
    },

    async searchNotes(query: string): Promise<Note[]> {
      return this.filterNotes({ query })
    },

    async filterNotes(filters: NoteFilters): Promise<Note[]> {
      return this.listNotes(filters)
    },

    async getPinnedNotes(): Promise<Note[]> {
      return this.filterNotes({ isPinned: true })
    },

    async getFavoriteNotes(): Promise<Note[]> {
      return this.filterNotes({ isFavorite: true })
    },

    async getRecentNotes(limit = 5): Promise<Note[]> {
      return (await this.listNotes(undefined, 'updated-desc')).slice(0, limit)
    },

    async getHighImpactNotes(): Promise<Note[]> {
      return this.filterNotes({ impact: 'high' })
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
