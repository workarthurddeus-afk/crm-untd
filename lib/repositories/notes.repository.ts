import { notesSeed } from '@/lib/mocks/seeds/notes.seed'
import type { Note, NoteInput } from '@/lib/types'
import { generateExcerpt, filterNotes as applyNoteFilters, normalizeNote, normalizeTag, sortNotes, type NoteFilters, type NoteSort } from '@/lib/utils/notes'
import { createMockRepository } from './mock-storage'
import { createNotesSupabaseRepository, type NotesRepository } from './notes.supabase.repository'

const storageRepo = createMockRepository<Note>('untd-notes', notesSeed.map(normalizeNote))

type CreateNoteInput = Partial<NoteInput> &
  Pick<Partial<Note>, 'excerpt'> &
  Pick<NoteInput, 'title' | 'content' | 'type' | 'status' | 'priority' | 'impact' | 'effort' | 'color'>

function deriveRelatedTo(input: Partial<Note>): Note['relatedTo'] {
  if (input.relatedLeadId) return 'lead'
  if (input.relatedTaskId) return 'task'
  if (input.relatedFeedbackId) return 'feedback'
  if (input.relatedProjectId) return 'project'
  return input.relatedTo ?? 'general'
}

function completeForCreate(input: CreateNoteInput): Omit<Note, 'id' | 'createdAt' | 'updatedAt'> {
  const tags = [...new Set((input.tags ?? []).map(normalizeTag).filter(Boolean))]
  const isPinned = input.isPinned ?? false
  const isFavorite = input.isFavorite ?? false
  const isArchived = input.isArchived ?? input.status === 'archived'
  return {
    title: input.title,
    content: input.content,
    excerpt: input.excerpt ?? generateExcerpt(input.content),
    type: input.type,
    status: isArchived ? 'archived' : input.status,
    priority: input.priority,
    impact: input.impact,
    effort: input.effort,
    color: input.color,
    tags,
    folderId: input.folderId ?? null,
    isPinned,
    isFavorite,
    isArchived,
    isDeleted: input.isDeleted ?? false,
    relatedLeadId: input.relatedLeadId ?? null,
    relatedTaskId: input.relatedTaskId ?? null,
    relatedFeedbackId: input.relatedFeedbackId ?? null,
    relatedProjectId: input.relatedProjectId ?? null,
    source: input.source ?? 'manual',
    lastViewedAt: input.lastViewedAt ?? null,
    tagIds: tags,
    relatedTo: deriveRelatedTo(input),
    pinned: isPinned,
    favorited: isFavorite,
    expectedImpact: input.impact,
    estimatedEffort: input.effort,
  }
}

function completeForUpdate(current: Note, patch: Partial<Note>): Partial<Note> {
  const next = normalizeNote({ ...current, ...patch })
  const tags = patch.tags ? [...new Set(patch.tags.map(normalizeTag).filter(Boolean))] : next.tags
  const isPinned = patch.isPinned ?? patch.pinned ?? next.isPinned
  const isFavorite = patch.isFavorite ?? patch.favorited ?? next.isFavorite
  const isArchived = patch.isArchived ?? (patch.status === 'archived' ? true : next.isArchived)
  return {
    ...patch,
    excerpt: patch.excerpt ?? (patch.content ? generateExcerpt(patch.content) : next.excerpt),
    tags,
    tagIds: tags,
    isPinned,
    pinned: isPinned,
    isFavorite,
    favorited: isFavorite,
    isArchived,
    status: isArchived ? 'archived' : patch.status ?? next.status,
    relatedTo: deriveRelatedTo({ ...next, ...patch }),
    expectedImpact: patch.impact ?? next.impact,
    estimatedEffort: patch.effort ?? next.effort,
  }
}

async function allNotes(): Promise<Note[]> {
  return (await storageRepo.list()).map(normalizeNote)
}

function createLocalNotesRepository(): NotesRepository {
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
    const note = await storageRepo.getById(id)
    return note ? normalizeNote(note) : null
  },
  async create(data: CreateNoteInput): Promise<Note> {
    return this.createNote(data)
  },
  async createNote(data: CreateNoteInput): Promise<Note> {
    return normalizeNote(await storageRepo.create(completeForCreate(data)))
  },
  async update(id: string, data: Partial<Note>): Promise<Note> {
    return this.updateNote(id, data)
  },
  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    const current = await storageRepo.getById(id)
    if (!current) throw new Error(`Note ${id} not found`)
    return normalizeNote(await storageRepo.update(id, completeForUpdate(current, data)))
  },
  async delete(id: string): Promise<void> {
    await storageRepo.delete(id)
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

export type NotesDataSource = 'local' | 'supabase'

export function resolveNotesDataSource(value: string | undefined): NotesDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

export function createNotesRepository(
  dataSource: NotesDataSource = resolveNotesDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
): NotesRepository {
  if (dataSource === 'supabase') return createNotesSupabaseRepository()
  return createLocalNotesRepository()
}

export const notesRepo = createNotesRepository()
